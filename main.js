window.onload = function() {
	
	var container = document.getElementById( 'container' ),
		containerWidth, containerHeight,
		renderer,
		scene,
		camera,
		cubes,
		geom,
		range = 50,
		mouseVector,
		axes,
		controls;

	containerWidth = container.clientWidth;
	containerHeight = container.clientHeight;

	// Set up renderer, scene and camera
	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor( 0xff0000 );
	renderer.setSize( containerWidth, containerHeight );

	container.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	var scene2 = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, containerWidth / containerHeight, 1, 10000 );
	camera.position.set( 0, 0, range * 2 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	// Add some cubes to the scene
	geom = new THREE.CubeGeometry( 5, 5, 5 );

	cubes = new THREE.Object3D();
	var cubes2 = new THREE.Object3D();
	scene.add( cubes );
	scene2.add( cubes2 );

	var nObjects = 5;
	for(var i = 0; i < nObjects ; i++ ) {

		var grayness = (Math.random() * 0.5 + 0.25);
		var uniforms = {
			color:	{ type: "c", value: new THREE.Color().setRGB( grayness, grayness, grayness ) },
			objID:	{ type: "f", value: i / nObjects }
		};
		var attributes = {
			objID: { type: 'f', value: [] }
		};

		var mat = new THREE.ShaderMaterial( {
			uniforms: 		uniforms,
			//attributes:     attributes,
			vertexShader:   document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent
		});

		var mat2 = new THREE.ShaderMaterial( {
			uniforms: 		uniforms,
			//attributes:     attributes,
			vertexShader:   document.getElementById( 'vertexshader2' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader2' ).textContent
		});

		var cube = new THREE.Mesh( geom, mat );
		var cube2 = new THREE.Mesh( geom, mat2 );

/*
		// set attribute value.
		var vertices = geom.vertices;
		var values = attributes.objID.value;
		for ( var v = 0; v < vertices.length ; v++ ) {

			values[ v ] = 1;
		}*/
		var pos = [ range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) ];
		var rot = [ Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI ];
		cube.position.set( pos[0], pos[1], pos[2] );
		cube.rotation.set( rot[0], rot[1], rot[2] );
		cube.grayness = grayness;
		cubes.add( cube );

		cube2.position.set( pos[0], pos[1], pos[2] );
		cube2.rotation.set( rot[0], rot[1], rot[2] );
		cube2.grayness = grayness;
		cubes2.add( cube2 );
	}

	// Axes
	axes = buildAxes();
	scene.add( axes );
	var axes2 = buildAxes();
	scene2.add( axes2 );

	// Picking stuff

	projector = new THREE.Projector();
	mouseVector = new THREE.Vector3();

	// User interaction
	window.addEventListener( 'mousemove', onMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

	controls = new THREE.TrackballControls( camera );
	controls.zoomSpeed = 0.01;

	var renderTargetParams = {
		minFilter:THREE.LinearFilter,
		stencilBuffer:false,
		depthBuffer:true
	};
	var renderTargetTex = new THREE.WebGLRenderTarget( containerWidth, containerHeight, renderTargetParams );
	var buffer = new Uint8Array( 4 * containerWidth * containerHeight );

	// And go!
	animate();

	function renderWithPick() {
		renderer.render( scene, camera, renderTargetTex, true );

		// Read from tex.
		var gl = renderer.getContext();
		
		gl.readPixels( 0, 0, containerWidth, containerHeight, gl.RGBA, gl.UNSIGNED_BYTE, buffer );
		renderer.render( scene2, camera );
	}

	function onMouseMove( e ) {
		var index = Math.floor( (containerWidth * e.clientY + e.clientX) * 4 );

		document.getElementById("headline").innerHTML = buffer[ index ] * 10000.0 + buffer[ index + 1 ] * 100.0 + buffer[index + 2];
	}

	function onWindowResize( e ) {
		containerWidth = container.clientWidth;
		containerHeight = container.clientHeight;
		renderer.setSize( containerWidth, containerHeight );
		camera.aspect = containerWidth / containerHeight;
		camera.updateProjectionMatrix();
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		renderWithPick();
	}


	// http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
	function buildAxes() {
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 100, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -100, 0, 0 ), 0x800000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 100, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -100, 0 ), 0x008000, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 100 ), 0x0000FF, false ) ); // +Z
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -100 ), 0x000080, true ) ); // -Z

		return axes;

	}

	function buildAxis( src, dst, colorHex, dashed ) {
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );

		var axis = new THREE.Line( geom, mat );

		return axis;

	}

}


/*

function InitGeometry() {

	var vertexPositions = [
	// Front face
	[-2.5, -2.5,  2.5],
	[ 2.5, -2.5,  2.5],
	[ 2.5,  2.5,  2.5],
	[-2.5,  2.5,  2.5],

	// Back face
	[-2.5, -2.5, -2.5],
	[-2.5,  2.5, -2.5],
	[ 2.5,  2.5, -2.5],
	[ 2.5, -2.5, -2.5],

	// Top face
	[-2.5,  2.5, -2.5],
	[-2.5,  2.5,  2.5],
	[ 2.5,  2.5,  2.5],
	[ 2.5,  2.5, -2.5],

	// Bottom face
	[-2.5, -2.5, -2.5],
	[ 2.5, -2.5, -2.5],
	[ 2.5, -2.5,  2.5],
	[-2.5, -2.5,  2.5],

	// Right face
	[2.5, -2.5, -2.5],
	[2.5,  2.5, -2.5],
	[2.5,  2.5,  2.5],
	[2.5, -2.5,  2.5],

	// Left face
	[-2.5, -2.5, -2.5],
	[-2.5, -2.5,  2.5],
	[-2.5,  2.5,  2.5],
	[-2.5,  2.5, -2.5]
	];

	var cubeVertexIndices = [
	0,  1,  2,      0,  2,  3,    // front
	4,  5,  6,      4,  6,  7,    // back
	8,  9,  10,     8,  10, 11,   // top
	12, 13, 14,     12, 14, 15,   // bottom
	16, 17, 18,     16, 18, 19,   // right
	20, 21, 22,     20, 22, 23    // left
	];

	var vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex
	for ( var i = 0; i < vertexPositions.length; i++ )
	{
		vertices[ i*3 + 0 ] = vertexPositions[i][0];
		vertices[ i*3 + 1 ] = vertexPositions[i][1];
		vertices[ i*3 + 2 ] = vertexPositions[i][2];
	}

	// itemSize = 3 because there are 3 values (components) per vertex
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	return geometry;
}

*/








