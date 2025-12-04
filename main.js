import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class ModelLoader {
    constructor() {
        this.loader = new GLTFLoader();
        this.models = {};
        this.loadingPromises = [];
    }
    
    loadModel(name, path) {
        const promise = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    console.log(`✅ Loaded ${name}`);
                    this.models[name] = gltf.scene;
                    
                    // Enable shadows for all meshes in the model
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    resolve(gltf.scene);
                },
                (progress) => {
                    console.log(`Loading ${name}: ${(progress.loaded / progress.total * 100)}%`);
                },
                (error) => {
                    console.error(`❌ Error loading ${name}:`, error);
                    reject(error);
                }
            );
        });
        
        this.loadingPromises.push(promise);
        return promise;
    }
    
    async loadAllModels() {
        // Set a 10-second timeout
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Loading timeout')), 10000)
        );
        
        // Load all models
        this.loadModel('laptop', './assets/models/laptop.glb');
        this.loadModel('phone', './assets/models/phone.glb');
        this.loadModel('notebook', './assets/models/notebook.glb');
        this.loadModel('businessCard', './assets/models/business-card.glb');
        this.loadModel('folder', './assets/models/folder.glb');
        this.loadModel('resume', './assets/models/resume.glb');
        this.loadModel('ipad', './assets/models/ipad.glb');
        
        // Wait for all models to load or timeout
        try {
            await Promise.race([Promise.all(this.loadingPromises), timeout]);
            console.log('🎉 All models loaded successfully!');
            return true;
        } catch (error) {
            console.log('⚠️ Using fallback geometry due to:', error.message);
            return false;
        }
    }
    
    getModel(name) {
        return this.models[name] ? this.models[name].clone() : null;
    }
}

class PortfolioScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.modelLoader = new ModelLoader();
        
        this.init();
    }
    
    async init() {
        // Show loading screen
        document.getElementById('loading-screen').style.display = 'flex';
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create gradient background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;        
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('three-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Create basic desk
        this.createDesk();
        
        // Add lighting
        this.addLighting();
        
        // Load models and then add objects
        console.log('🔄 Loading 3D models...');
        const modelsLoaded = await this.modelLoader.loadAllModels();
        
        if (modelsLoaded) {
            this.add3DObjects();
            console.log('🎯 3D objects added to scene!');
        } else {
            console.log('⚠️ Some models failed, using fallback geometry');
            this.addFallbackObjects(); // Use fallback instead
        }
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 1000);
        
        // Start animation
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createDesk() {
        // Desk surface only - no objects yet
        const deskGeometry = new THREE.BoxGeometry(8, 0.2, 4);
        const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.y = -0.1;
        desk.receiveShadow = true;
        this.scene.add(desk);
    }
    
    add3DObjects() {
        // Get models and position them
        const laptop = this.modelLoader.getModel('laptop');
        if (laptop) {
            laptop.position.set(-2, 0.05, 0);
            laptop.scale.set(0.8, 0.8, 0.8);
            this.scene.add(laptop);
        }
        
        const phone = this.modelLoader.getModel('phone');
        if (phone) {
            phone.position.set(2, 0.08, -1);
            phone.scale.set(1.2, 1.2, 1.2);
            this.scene.add(phone);
        }
        
        const notebook = this.modelLoader.getModel('notebook');
        if (notebook) {
            notebook.position.set(1, 0.08, 1);
            notebook.scale.set(1, 1, 1);
            this.scene.add(notebook);
        }
        
        const businessCard = this.modelLoader.getModel('businessCard');
        if (businessCard) {
            businessCard.position.set(-1, 0.06, -1.5);
            businessCard.rotation.z = 0.1;
            businessCard.scale.set(1, 1, 1);
            this.scene.add(businessCard);
        }
        
        const folder = this.modelLoader.getModel('folder');
        if (folder) {
            folder.position.set(0, 0.08, -1.2);
            folder.scale.set(1, 1, 1);
            this.scene.add(folder);
        }
        
        const resume = this.modelLoader.getModel('resume');
        if (resume) {
            resume.position.set(-2.5, 0.06, 1.2);
            resume.rotation.z = 0.1;
            resume.scale.set(1, 1, 1);
            this.scene.add(resume);
        }
        
        const ipad = this.modelLoader.getModel('ipad');
        if (ipad) {
            ipad.position.set(2.5, 0.08, 0.5);
            ipad.rotation.y = -0.3;
            ipad.scale.set(1, 1, 1);
            this.scene.add(ipad);
        }
        
        // Set up interactions
        this.setupInteractions([laptop, phone, notebook, businessCard, folder, resume, ipad]);
    }
    
    addFallbackObjects() {
        // Your original enhanced geometry objects as fallback
        // Laptop
        const laptopGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
        const laptopMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const laptop = new THREE.Mesh(laptopGeometry, laptopMaterial);
        laptop.position.set(-2, 0.15, 0);
        laptop.castShadow = true;
        this.scene.add(laptop);
        
        // Phone
        const phoneGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.6);
        const phoneMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
        phone.position.set(2, 0.125, -1);
        phone.castShadow = true;
        this.scene.add(phone);
        
        // Notebook
        const notebookGeometry = new THREE.BoxGeometry(1, 0.1, 1.3);
        const notebookMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const notebook = new THREE.Mesh(notebookGeometry, notebookMaterial);
        notebook.position.set(1, 0.15, 1);
        notebook.castShadow = true;
        this.scene.add(notebook);
        
        // Business card
        const cardGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.4);
        const cardMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const businessCard = new THREE.Mesh(cardGeometry, cardMaterial);
        businessCard.position.set(-1, 0.11, -1.5);
        businessCard.castShadow = true;
        this.scene.add(businessCard);
        
        // Folder
        const folderGeometry = new THREE.BoxGeometry(0.8, 0.05, 1.1);
        const folderMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        const folder = new THREE.Mesh(folderGeometry, folderMaterial);
        folder.position.set(0, 0.125, -1.2);
        folder.castShadow = true;
        this.scene.add(folder);
        
        // Resume sheet
        const resumeGeometry = new THREE.BoxGeometry(0.5, 0.01, 0.7);
        const resumeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const resumeSheet = new THREE.Mesh(resumeGeometry, resumeMaterial);
        resumeSheet.position.set(-2.5, 0.11, 1.2);
        resumeSheet.rotation.z = 0.1;
        resumeSheet.castShadow = true;
        this.scene.add(resumeSheet);
        
        // iPad
        const ipadGeometry = new THREE.BoxGeometry(1.2, 0.08, 1.6);
        const ipadMaterial = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
        const ipad = new THREE.Mesh(ipadGeometry, ipadMaterial);
        ipad.position.set(2.5, 0.14, 0.5);
        ipad.rotation.y = -0.3;
        ipad.castShadow = true;
        this.scene.add(ipad);
        
        // Set up interactions
        this.setupInteractions([laptop, phone, notebook, businessCard, folder, resumeSheet, ipad]);
    }
    
    setupInteractions(objects) {
        // Set up interactions for all objects
        this.interactionManager = new InteractionManager(this.scene, this.camera, this.renderer, this.controls);
        
        const types = ['laptop', 'phone', 'notebook', 'businessCard', 'folder', 'resume', 'ipad'];
        
        objects.forEach((obj, index) => {
            if (obj) {
                this.interactionManager.addClickableObject(obj, types[index]);
            }
        });

        // Add floating animation
        this.addFloatingAnimation();
    }
    
    addLighting() {
        // Ambient light - warmer tone
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light - cooler, more dramatic
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(8, 12, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        
        // Warm desk lamp light - more atmospheric
        const pointLight = new THREE.PointLight(0xffa500, 0.8, 12);
        pointLight.position.set(-3, 4, 2);
        pointLight.castShadow = true;
        this.scene.add(pointLight);
        
        // Add a subtle rim light from behind
        const rimLight = new THREE.DirectionalLight(0x4080ff, 0.3);
        rimLight.position.set(-5, 3, -5);
        this.scene.add(rimLight);
        
        // Add subtle fill light
        const fillLight = new THREE.PointLight(0x8080ff, 0.2, 20);
        fillLight.position.set(5, 2, -3);
        this.scene.add(fillLight);
    }
    
    addFloatingAnimation() {
        // Add subtle floating animation to some objects
        this.floatingObjects = [];
        
        // Find objects to animate
        const objectsToFloat = ['phone', 'businessCard'];
        
        if (this.interactionManager && this.interactionManager.clickableObjects) {
            this.interactionManager.clickableObjects.forEach(obj => {
                if (objectsToFloat.includes(obj.userData.type)) {
                    this.floatingObjects.push({
                        object: obj,
                        originalY: obj.position.y,
                        speed: Math.random() * 0.02 + 0.01,
                        amplitude: 0.02 + Math.random() * 0.01
                    });
                }
            });
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Floating animation
        if (this.floatingObjects) {
            const time = performance.now() * 0.001;
            this.floatingObjects.forEach(item => {
                item.object.position.y = item.originalY + Math.sin(time * item.speed) * item.amplitude;
            });
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Keep your entire InteractionManager class exactly as it was - no changes needed
class InteractionManager {
    constructor(scene, camera, renderer, controls) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clickableObjects = [];
        
        // Get overlay elements
        this.contentOverlay = document.getElementById('content-overlay');
        this.contentBody = document.getElementById('content-body');
        this.closeBtn = document.querySelector('.close-btn');
        
        // Add event listeners
        renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.closeBtn.addEventListener('click', () => this.hideContent());
        
        // Close on background click
        this.contentOverlay.addEventListener('click', (event) => {
            if (event.target === this.contentOverlay) {
                this.hideContent();
            }
        });
    }
    
    addClickableObject(object, type, data = {}) {
        object.userData = { type, ...data };
        this.clickableObjects.push(object);
        
        // Make sure materials are set up for transparency
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
            }
        });
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableObjects, true);
        
        // Reset all objects first
        this.clickableObjects.forEach(obj => {
            obj.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 1.0;
                }
            });
            obj.scale.set(1, 1, 1);
            if (obj.userData.originalY !== undefined) {
                obj.position.y = obj.userData.originalY;
            }
        });
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            const hoveredObject = intersects[0].object.parent || intersects[0].object;
            
            // Store original Y position if not stored
            if (hoveredObject.userData.originalY === undefined) {
                hoveredObject.userData.originalY = hoveredObject.position.y;
            }
            
            // Hover effects
            hoveredObject.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 0.8;
                }
            });
            hoveredObject.scale.set(1.05, 1.05, 1.05);
            hoveredObject.position.y = hoveredObject.userData.originalY + 0.05;
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableObjects, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object.parent || intersects[0].object;
            this.handleObjectClick(clickedObject);
        }
    }
    
    handleObjectClick(object) {
        const { type } = object.userData;
        
        // Animate camera to focus on clicked object
        this.animateCameraToObject(object);
        
        // Show content after a short delay
        setTimeout(() => {
            switch(type) {
                case 'laptop': this.showGamesSection(); break;
                case 'phone': this.showAppsSection(); break;
                case 'notebook': this.showNotebooksSection(); break;
                case 'businessCard': this.showAboutSection(); break;
                case 'folder': this.showProjectsSection(); break;
                case 'resume': this.showResumeSection(); break;
                case 'ipad': this.showArtworkSection(); break;
            }
        }, 500);
    }
    
    animateCameraToObject(targetObject) {
        // Get current camera position
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        
        // Calculate ideal viewing position for the object
        const objectPosition = targetObject.position.clone();
        const idealDistance = 3;
        const idealHeight = 2;
        
        // Calculate new camera position
        const newPosition = new THREE.Vector3(
            objectPosition.x + idealDistance,
            objectPosition.y + idealHeight,
            objectPosition.z + idealDistance
        );
        
        const newTarget = objectPosition.clone();
        newTarget.y += 0.5;
        
        // Animate camera movement
        const duration = 1500;
        const startTime = performance.now();
        
        const animateCamera = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const easedProgress = easeInOut(progress);
            
            // Interpolate camera position and target
            this.camera.position.lerpVectors(startPosition, newPosition, easedProgress);
            this.controls.target.lerpVectors(startTarget, newTarget, easedProgress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        requestAnimationFrame(animateCamera);
    }
    
    showContent(content) {
        this.contentBody.innerHTML = content;
        this.contentOverlay.classList.remove('hidden');
    }
    
    hideContent() {
        this.contentOverlay.classList.add('hidden');
    }
    
    // All your existing content methods stay exactly the same
    showGamesSection() {
        const content = `
            <div class="content-section">
                <h2>🎮 Unity Game Development</h2>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>3D Obstacle Course</h4>
                        <p>A Unity 3D scene featuring an obstacle course designed to showcase fundamental Unity skills learned through the Unity Beginner course.</p>
                        <p><strong>Technologies:</strong> Unity, C#</p>
                        <p><strong>Features:</strong> 3D environment design, obstacle mechanics, scene navigation</p>
                        <p><strong>Learning Focus:</strong> Unity interface, 3D scene construction, basic C# scripting</p>
                    </div>
                    <div class="project-card">
                        <h4>Unity Skills Acquired</h4>
                        <p>Through the Unity Beginner course, I gained foundational knowledge in game development and 3D scene creation.</p>
                        <p><strong>Skills:</strong> Scene management, GameObject manipulation, basic scripting</p>
                        <p><strong>Tools:</strong> Unity Editor, C# scripting</p>
                    </div>
                    <div class="project-card">
                        <h4>Future Game Development</h4>
                        <p>Building on my Unity foundation to create more complex interactive experiences and games.</p>
                        <p><strong>Goals:</strong> Advanced C# scripting, game mechanics, physics implementation</p>
                        <p><strong>Status:</strong> Continuing to learn and develop skills</p>
                    </div>
                </div>
            </div>
        `;
        this.showContent(content);
    }
    
    showAppsSection() {
        const content = `
            <div class="content-section">
                <h2>📱 Figma App Designs</h2>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>NeuroNutrition App</h4>
                        <p><strong>Congressional App Challenge Project</strong></p>
                        <p>A collaborative app designed to help neurodivergent people navigate their health and wellbeing appropriately for their unique needs. Created as part of a team effort to address accessibility in healthcare.</p>
                        <p><strong>Tools:</strong> Figma, Canva</p>
                        <p><strong>Role:</strong> Team Member</p>
                        <p><strong>Focus:</strong> User-centered design for accessibility</p>
                    </div>
                    <div class="project-card">
                        <h4>UI/UX Design Skills</h4>
                        <p>Through the NeuroNutrition project, I developed skills in user interface design, accessibility considerations, and collaborative design processes.</p>
                        <p><strong>Learning Focus:</strong> Designing for neurodivergent users</p>
                        <p><strong>Key Skills:</strong> User research, wireframing, prototyping</p>
                    </div>
                    <div class="project-card">
                        <h4>Design Process</h4>
                        <p>Learned to create user-centered designs that prioritize accessibility and inclusivity, working within a team to develop comprehensive app mockups.</p>
                        <p><strong>Tools:</strong> Figma for UI design, Canva for graphics</p>
                    </div>
                </div>
            </div>
        `;
        this.showContent(content);
    }
    
    showNotebooksSection() {
        const content = `
            <div class="content-section">
                <h2>📔 Digital Notebooks</h2>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>Class Notebook #1</h4>
                        <p>Notes and projects from your first class.</p>
                        <p><strong>Subject:</strong> Web Development</p>
                    </div>
                    <div class="project-card">
                        <h4>Class Notebook #2</h4>
                        <p>Documentation of your learning journey.</p>
                        <p><strong>Subject:</strong> Game Development</p>
                    </div>
                    <div class="project-card">
                        <h4>Research Notes</h4>
                        <p>Your research and exploration notes.</p>
                        <p><strong>Focus:</strong> 3D Development</p>
                    </div>
                </div>
            </div>
        `;
        this.showContent(content);
    }
    
    showAboutSection() {
        const content = `
            <div class="content-section">
                <h2>👋 About Micah Kennedy</h2>
                <h3>Class of 2026 | Thomas A. Edison CTE High School</h3>
                <p>I'm a passionate student with 3 years of experience in web development, specializing in HTML and CSS. My ultimate goal is to become a Medical Physicist and contribute to finding a cure for cancer. When I'm not coding, you'll find me crocheting, reading, or working on 3D animations!</p>
                
                <h3>Contact</h3>
                <p>📧 micahk13@nycstudents.net</p>
                
                <h3>Skills & Technologies</h3>
                <div class="skills-grid">
                    <div class="skill-tag">HTML (3+ years)</div>
                    <div class="skill-tag">CSS (3+ years)</div>
                    <div class="skill-tag">JavaScript</div>
                    <div class="skill-tag">C#</div>
                    <div class="skill-tag">Python</div>
                    <div class="skill-tag">Unity</div>
                    <div class="skill-tag">Blender</div>
                    <div class="skill-tag">Figma</div>
                    <div class="skill-tag">Canva</div>
                </div>
                
                <h3>Interests & Hobbies</h3>
                <p><strong>Future Aspirations:</strong> Medical Physics - working toward curing cancer<br>
                <strong>Creative Pursuits:</strong> 3D Animation, Crocheting<br>
                <strong>Personal:</strong> Avid reader, always learning new technologies</p>
                
                <h3>What I'm Currently Learning</h3>
                <p>Expanding my skills in Three.js for immersive web experiences, diving deeper into Unity for game development, and exploring advanced JavaScript frameworks. Always excited to tackle new challenges!</p>
            </div>
        `;
        this.showContent(content);
    }
    
    showProjectsSection() {
        const content = `
            <div class="content-section">
                <h2>📁 School Projects - Senior Year</h2>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>NeuroNutrition App (Team Project)</h4>
                        <p><strong>Congressional App Challenge</strong></p>
                        <p>Collaborative project creating an app to help neurodivergent individuals navigate health and wellbeing. Focused on accessibility and user-centered design.</p>
                        <p><strong>My Role:</strong> UI/UX Design Team Member</p>
                        <p><strong>Tools:</strong> Figma, Canva</p>
                        <p><strong>Skills Developed:</strong> Team collaboration, accessibility design, user research</p>
                    </div>
                    <div class="project-card">
                        <h4>Loved Pets Website (Individual)</h4>
                        <p><strong>Mock Client Project</strong></p>
                        <p>Built a complete website for Loved Pets, an animal shelter charity, based on provided client requirements and assets. Created responsive design with interactive features.</p>
                        <p><strong>Technologies:</strong> HTML, CSS, JavaScript</p>
                        <p><strong>Features:</strong> Responsive design, interactive elements, charity-focused content</p>
                        <p><strong>Skills Applied:</strong> Client requirements analysis, responsive web design</p>
                    </div>
                    <div class="project-card">
                        <h4>3D Portfolio Website</h4>
                        <p><strong>Current Project</strong></p>
                        <p>Interactive 3D portfolio built with Three.js, showcasing work through an immersive desk environment. Features clickable objects and smooth 3D navigation.</p>
                        <p><strong>Technologies:</strong> Three.js, HTML, CSS, JavaScript, Vite</p>
                        <p><strong>Status:</strong> In Development - First Marking Period</p>
                    </div>
                </div>
            </div>
        `;
        this.showContent(content);
    }

    showResumeSection() {
        const content = `
            <div class="content-section">
                <h2>📄 Resume</h2>
                <div style="text-align: left; max-width: 600px; margin: 0 auto;">
                    <h3>Micah Kennedy</h3>
                    <p><strong>Web & App Development Student | Future Medical Physicist</strong></p>
                    <p>📧 micah.kennedy28@gmail.com | 📱 (646) 345-1356 | 📍 Queens, NY</p>
                    
                    <h3>Education</h3>
                    <p><strong>Thomas A. Edison CTE High School</strong> - Class of 2026<br>
                    Web & App Development Program<br>
                    • <strong>Top 5% of Class</strong> | Gold Honor Roll<br>
                    • NHS, NTHS, NYS Science Honor Society<br>
                    • Academic Excellence & Positive Role Model Awards</p>
                    
                    <h3>Certifications</h3>
                    <div class="skills-grid">
                        <div class="skill-tag">IT Specialist - HTML & CSS (2024)</div>
                        <div class="skill-tag">IT Specialist - Python (2025)</div>
                    </div>
                    
                    <h3>Professional Experience</h3>
                    <p><strong>America On Tech</strong> - Web Developer Intern (July 2024)<br>
                    • Built responsive websites using HTML, CSS, JavaScript<br>
                    • Enhanced performance and UX through clean code and SEO<br>
                    • Collaborated with dev teams on real-world client projects</p>
                    
                    <p><strong>GameU</strong> - Game Design Intern (July-August 2024)<br>
                    • Designed and tested interactive game levels in Unity<br>
                    • Created original characters and assets using Blender<br>
                    • Led playtests to improve game mechanics and storytelling</p>
                    
                    <p><strong>Boys & Girls Club of Metro Queens</strong> - SYEP Intern (2023, 2024)<br>
                    • Researched and developed team presentations and reports<br>
                    • Assisted in youth program design and leadership activities</p>
                    
                    <h3>Leadership & Service</h3>
                    <p><strong>Community Volunteer</strong> - Beulah Church Food Pantry (2019-Present)<br>
                    <strong>Research Project:</strong> "Digital Dilemma" - National internet-access law proposal<br>
                    <strong>Organizations:</strong> HOSA, BSU, We the Light Club</p>
                    
                    <h3>Technical Skills</h3>
                    <p>HTML/CSS (Certified), Python (Certified), JavaScript, Unity, C#, Blender, SEO, Project Management, Digital Media, Spreadsheet Analysis</p>
                </div>
            </div>
        `;
        this.showContent(content);
    }

    showArtworkSection() {
        const content = `
            <div class="content-section">
                <h2>🎨 Artwork & Animations</h2>
                <p>Creative work including digital art, animations, and visual projects:</p>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>Digital Illustrations</h4>
                        <p>Original artwork created using digital tools and software.</p>
                        <p><strong>Tools:</strong> Photoshop, Illustrator</p>
                    </div>
                    <div class="project-card">
                        <h4>3D Models</h4>
                        <p>3D assets and models created in Blender for various projects.</p>
                        <p><strong>Tools:</strong> Blender, Maya</p>
                    </div>
                    <div class="project-card">
                        <h4>Animations</h4>
                        <p>Motion graphics and character animations for games and projects.</p>
                        <p><strong>Tools:</strong> After Effects, Blender</p>
                    </div>
                    <div class="project-card">
                        <h4>UI/UX Mockups</h4>
                        <p>Interface designs and user experience prototypes.</p>
                        <p><strong>Tools:</strong> Figma, Adobe XD</p>
                    </div>
                </div>
            </div>
        `;
        this.showContent(content);
    }
}

// Initialize the portfolio scene
new PortfolioScene();
