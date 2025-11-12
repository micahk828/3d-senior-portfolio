import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class PortfolioScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.init();
        this.animate();
        
        // Hide loading screen after 3 seconds
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 3000);
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
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
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createDesk() {
        // Desk surface
        const deskGeometry = new THREE.BoxGeometry(8, 0.2, 4);
        const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.y = -0.1;
        desk.receiveShadow = true;
        this.scene.add(desk);
        
        // Simple placeholder objects (we'll replace these with detailed models later)
        this.addPlaceholderObjects();
    }
    
    addPlaceholderObjects() {
    // Laptop placeholder (for games)
    const laptopGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
    const laptopMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const laptop = new THREE.Mesh(laptopGeometry, laptopMaterial);
    laptop.position.set(-2, 0.15, 0);
    laptop.castShadow = true;
    this.scene.add(laptop);
    
    // Phone placeholder (for apps)
    const phoneGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.6);
    const phoneMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
    phone.position.set(2, 0.125, -1);
    phone.castShadow = true;
    this.scene.add(phone);
    
    // Notebook placeholder (for digital notebooks)
    const notebookGeometry = new THREE.BoxGeometry(1, 0.1, 1.3);
    const notebookMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const notebook = new THREE.Mesh(notebookGeometry, notebookMaterial);
    notebook.position.set(1, 0.15, 1);
    notebook.castShadow = true;
    this.scene.add(notebook);
    
    // Business card placeholder (for about me)
    const cardGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.4);
    const cardMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const businessCard = new THREE.Mesh(cardGeometry, cardMaterial);
    businessCard.position.set(-1, 0.11, -1.5);
    businessCard.castShadow = true;
    this.scene.add(businessCard);
    
    // 📁 FOLDER placeholder (for projects)
    const folderGeometry = new THREE.BoxGeometry(0.8, 0.05, 1.1);
    const folderMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 }); // Golden color
    const folder = new THREE.Mesh(folderGeometry, folderMaterial);
    folder.position.set(0, 0.125, -1.2);
    folder.castShadow = true;
    this.scene.add(folder);
    
    // 📄 RESUME SHEET placeholder
    const resumeGeometry = new THREE.BoxGeometry(0.5, 0.01, 0.7);
    const resumeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const resumeSheet = new THREE.Mesh(resumeGeometry, resumeMaterial);
    resumeSheet.position.set(-2.5, 0.11, 1.2);
    resumeSheet.rotation.z = 0.1; // Slight rotation for realism
    resumeSheet.castShadow = true;
    this.scene.add(resumeSheet);
    
    // 📱 iPAD placeholder (for artwork & animations)
    const ipadGeometry = new THREE.BoxGeometry(1.2, 0.08, 1.6);
    const ipadMaterial = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
    const ipad = new THREE.Mesh(ipadGeometry, ipadMaterial);
    ipad.position.set(2.5, 0.14, 0.5);
    ipad.rotation.y = -0.3; // Angled for better view
    ipad.castShadow = true;
    this.scene.add(ipad);
    
    // Set up interactions for ALL objects
    this.interactionManager = new InteractionManager(this.scene, this.camera, this.renderer);
    this.interactionManager.addClickableObject(laptop, 'laptop');
    this.interactionManager.addClickableObject(phone, 'phone');
    this.interactionManager.addClickableObject(notebook, 'notebook');
    this.interactionManager.addClickableObject(businessCard, 'businessCard');
    this.interactionManager.addClickableObject(folder, 'folder');
    this.interactionManager.addClickableObject(resumeSheet, 'resume');
    this.interactionManager.addClickableObject(ipad, 'ipad');
}
    
    addLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Warm desk lamp light
        const pointLight = new THREE.PointLight(0xffa500, 0.6, 10);
        pointLight.position.set(-3, 3, 2);
        pointLight.castShadow = true;
        this.scene.add(pointLight);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
// Add this class before the final line
class InteractionManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
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
        object.material.transparent = true;
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableObjects);
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            intersects[0].object.material.opacity = 0.8;
        } else {
            document.body.style.cursor = 'default';
            this.clickableObjects.forEach(obj => {
                obj.material.opacity = 1.0;
            });
        }
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableObjects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            this.handleObjectClick(clickedObject);
        }
    }
    
    handleObjectClick(object) {
    const { type } = object.userData;
    
    switch(type) {
        case 'laptop':
            this.showGamesSection();
            break;
        case 'phone':
            this.showAppsSection();
            break;
        case 'notebook':
            this.showNotebooksSection();
            break;
        case 'businessCard':
            this.showAboutSection();
            break;
        case 'folder':
            this.showProjectsSection();
            break;
        case 'resume':
            this.showResumeSection();
            break;
        case 'ipad':
            this.showArtworkSection();
            break;
    }
}
    
    showContent(content) {
        this.contentBody.innerHTML = content;
        this.contentOverlay.classList.remove('hidden');
    }
    
    hideContent() {
        this.contentOverlay.classList.add('hidden');
    }
    
    showGamesSection() {
        const content = `
            <div class="content-section">
                <h2>🎮 Games I've Created</h2>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>Unity Game #1</h4>
                        <p>Description of your first Unity game. What mechanics did you implement? What was challenging?</p>
                        <p><strong>Tech:</strong> Unity, C#</p>
                    </div>
                    <div class="project-card">
                        <h4>Unity Game #2</h4>
                        <p>Description of your second Unity game. How did you improve from the first one?</p>
                        <p><strong>Tech:</strong> Unity, C#</p>
                    </div>
                    <div class="project-card">
                        <h4>Game Concept</h4>
                        <p>A game idea you're working on or planning to develop.</p>
                        <p><strong>Status:</strong> In Development</p>
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
                        <h4>App Design #1</h4>
                        <p>Description of your first Figma app design. What problem does it solve?</p>
                        <p><strong>Focus:</strong> UI/UX Design</p>
                    </div>
                    <div class="project-card">
                        <h4>App Design #2</h4>
                        <p>Another app concept you've designed in Figma.</p>
                        <p><strong>Focus:</strong> Mobile Interface</p>
                    </div>
                    <div class="project-card">
                        <h4>Design System</h4>
                        <p>Components and design patterns you've created.</p>
                        <p><strong>Tool:</strong> Figma</p>
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
                <h3>Senior Developer & Designer</h3>
                <p>I'm a passionate senior student specializing in web development, game development, and 3D experiences. I love creating interactive digital experiences that push the boundaries of what's possible on the web.</p>
                
                <h3>Skills & Technologies</h3>
                <div class="skills-grid">
                    <div class="skill-tag">HTML/CSS</div>
                    <div class="skill-tag">JavaScript</div>
                    <div class="skill-tag">Three.js</div>
                    <div class="skill-tag">Unity</div>
                    <div class="skill-tag">C#</div>
                    <div class="skill-tag">Figma</div>
                    <div class="skill-tag">Blender</div>
                    <div class="skill-tag">React</div>
                    <div class="skill-tag">GSAP</div>
                </div>
                
                <h3>What I'm Learning</h3>
                <p>Currently expanding my skills in Three.js, React, and GSAP to create more immersive web experiences. Always excited to learn new technologies and tackle challenging projects!</p>
            </div>
        `;
        this.showContent(content);
    }
    showProjectsSection() {
    const content = `
        <div class="content-section">
            <h2>📁 School Projects</h2>
            <p>Here are the projects I've worked on during my senior year:</p>
            <div class="project-grid">
                <div class="project-card">
                    <h4>Project #1</h4>
                    <p>Description of your first major school project this year.</p>
                    <p><strong>Skills Used:</strong> HTML, CSS, JavaScript</p>
                </div>
                <div class="project-card">
                    <h4>Project #2</h4>
                    <p>Another significant project from your coursework.</p>
                    <p><strong>Skills Used:</strong> Unity, C#</p>
                </div>
                <div class="project-card">
                    <h4>Collaborative Project</h4>
                    <p>A project where you worked with classmates or in a team.</p>
                    <p><strong>Role:</strong> Lead Developer</p>
                </div>
                <div class="project-card">
                    <h4>Personal Project</h4>
                    <p>Something you built on your own time to explore new skills.</p>
                    <p><strong>Status:</strong> Ongoing</p>
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
                <p><strong>Senior Student | Web & Game Developer</strong></p>
                <p>📧 your.email@example.com | 📱 (555) 123-4567</p>
                
                <h3>Education</h3>
                <p><strong>High School Diploma</strong> - Expected [Year]<br>
                Focus: Computer Science & Digital Media</p>
                
                <h3>Technical Skills</h3>
                <div class="skills-grid">
                    <div class="skill-tag">HTML/CSS</div>
                    <div class="skill-tag">JavaScript</div>
                    <div class="skill-tag">Three.js</div>
                    <div class="skill-tag">Unity</div>
                    <div class="skill-tag">C#</div>
                    <div class="skill-tag">Figma</div>
                    <div class="skill-tag">Blender</div>
                </div>
                
                <h3>Experience</h3>
                <p><strong>Student Developer</strong><br>
                • Built interactive 3D web experiences using Three.js<br>
                • Developed games in Unity with C#<br>
                • Created UI/UX designs in Figma</p>
                
                <h3>Projects</h3>
                <p><strong>3D Portfolio Website</strong> - Interactive desk environment showcasing work<br>
                <strong>Unity Games</strong> - Multiple game projects with various mechanics<br>
                <strong>Figma App Designs</strong> - Mobile and web application mockups</p>
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