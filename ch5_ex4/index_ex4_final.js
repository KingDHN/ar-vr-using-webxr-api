main();

function main() {
    const stats = initStats();

    // create context
    const canvas = document.querySelector("#c");
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    gl.shadowMap.enabled = true;

    // create camera
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    // create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0.3, 0.5, 0.8);
    const fog = new THREE.Fog("grey", 1, 90);
    scene.fog = fog;
    camera.lookAt(scene.position);

    // GEOMETRY
    const cubeSize = 4;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    const sphereRadius = 3;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 16);

    const planeGeometry = new THREE.PlaneGeometry(256, 128);

    // MATERIALS
    const textureLoader = new THREE.TextureLoader();

    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 'pink' });

    const sphereNormalMap = textureLoader.load('textures/sphere_normal.png');
    sphereNormalMap.wrapS = THREE.RepeatWrapping;
    sphereNormalMap.wrapT = THREE.RepeatWrapping;

    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 'tan',
        normalMap: sphereNormalMap
    });

    const planeTextureMap = textureLoader.load('textures/pebbles.jpg');
    planeTextureMap.wrapS = THREE.RepeatWrapping;
    planeTextureMap.wrapT = THREE.RepeatWrapping;
    planeTextureMap.repeat.set(16, 16);
    planeTextureMap.minFilter = THREE.NearestFilter;
    planeTextureMap.anisotropy = gl.capabilities.getMaxAnisotropy();

    const planeNorm = textureLoader.load('textures/pebbles_normal.png');
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);

    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide,
        normalMap: planeNorm
    });

    // MESHES
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(cubeSize + 1, cubeSize + 1, 0);
    cube.castShadow = true;
    scene.add(cube);

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    sphere.castShadow = true;
    scene.add(sphere);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // TEAPOT
    const teapotTexture = textureLoader.load('stone.jpg');
    teapotTexture.wrapS = THREE.RepeatWrapping;
    teapotTexture.wrapT = THREE.RepeatWrapping;

    const objLoader = new THREE.OBJLoader();

    objLoader.load(
        'teapot.obj',
        function (mesh) {
            const teapotMaterial = new THREE.MeshPhongMaterial({
                map: teapotTexture
            });

            mesh.children.forEach(function (child) {
                child.material = teapotMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            });

            mesh.position.set(-15, 2, 0);
            mesh.rotation.set(-Math.PI / 2, 0, 0);
            mesh.scale.set(0.005, 0.005, 0.005);

            scene.add(mesh);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log(error);
        }
    );

    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.target = plane;
    light.position.set(0, 30, 30);
    light.castShadow = true;
    scene.add(light);
    scene.add(light.target);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // ROBOT ARM
    let h1 = 6;
    let h2 = 5;
    let h3 = 4;

    let seg1 = addSeg(scene, h1, 0);
    let seg2 = addSeg(seg1, h2, h1);
    let seg3 = addSeg(seg2, h3, h2);

    // POINT LIGHT AT ROBOT TIP
    const robotTipLight = new THREE.PointLight(0xffaa00, 3, 15);
    robotTipLight.position.set(0, h3, 0);
    robotTipLight.castShadow = true;
    seg3.add(robotTipLight);

    const robotTipMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    robotTipMarker.position.set(0, h3, 0);
    seg3.add(robotTipMarker);

    // GUI
    const controls = new function () {
        this.rotationSpeed = 0.01;

        this.rotY1 = 0;
        this.rotZ1 = 0;
        this.rotZ2 = 0;
        this.rotZ3 = 0;
    };

    const gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'rotY1', 0, 2 * Math.PI);
    gui.add(controls, 'rotZ1', 0, 2 * Math.PI);
    gui.add(controls, 'rotZ2', 0, 2 * Math.PI);
    gui.add(controls, 'rotZ3', 0, 2 * Math.PI);

    // CONTROLS
    const trackballControls = initTrackballControls(camera, gl);
    const clock = new THREE.Clock();

    // DRAW
    function draw(time) {
        time *= 0.001;

        stats.update();
        trackballControls.update(clock.getDelta());

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cube.rotation.x += controls.rotationSpeed;
        cube.rotation.y += controls.rotationSpeed;
        cube.rotation.z += controls.rotationSpeed;

        sphere.rotation.x += controls.rotationSpeed;
        sphere.rotation.y += controls.rotationSpeed;
        sphere.rotation.z += controls.rotationSpeed;

        seg1.rotation.y = controls.rotY1;
        seg1.rotation.z = controls.rotZ1;
        seg2.rotation.z = controls.rotZ2;
        seg3.rotation.z = controls.rotZ3;

        light.position.x = 20 * Math.cos(time);
        light.position.y = 20 * Math.sin(time);

        gl.render(scene, camera);
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

// ROBOT SEGMENT FUNCTION
function addSeg(parent, height, posY) {
    const axisSphere = new THREE.Group();
    axisSphere.position.y = posY;
    parent.add(axisSphere);

    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.scale.x = 0.3;
    sphere.scale.y = height / 2;
    sphere.scale.z = 0.3;

    sphere.position.x = 0;
    sphere.position.y = height / 2;
    sphere.position.z = 0;

    sphere.castShadow = true;
    sphere.receiveShadow = true;

    axisSphere.add(sphere);

    // Longer axis helper lines
    const tripod = new THREE.AxesHelper(5);
    axisSphere.add(tripod);

    return axisSphere;
}

// RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}