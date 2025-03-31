import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


        // יוצר סצנה תלת מימדית
        let scene, camera, renderer, controls;
        let house = new THREE.Group();
        
        // משתנים לחישוב הפאנלים
        let panelSize = 0.5; // מטרים - 50 ס"מ
        let buildingWidth = 3;
        let buildingLength = 4;
        let buildingHeight = 2.5;
        let roofAngle = 30;
        
        function initScene() {
            // יצירת סצנה
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0);
            
            // יצירת מצלמה
            camera = new THREE.PerspectiveCamera(
                45, 
                document.getElementById('scene-container').clientWidth / 
                document.getElementById('scene-container').clientHeight, 
                0.1, 
                1000
            );
            camera.position.set(8, 5, 8);
            
            // יצירת רנדרר
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(
                document.getElementById('scene-container').clientWidth, 
                document.getElementById('scene-container').clientHeight
            );
            document.getElementById('scene-container').appendChild(renderer.domElement);
            
            // הוספת שליטה במצלמה
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            
            // הוספת תאורה
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 7.5);
            scene.add(directionalLight);
            
            // הוספת רצפה
            const gridHelper = new THREE.GridHelper(20, 20);
            scene.add(gridHelper);
            
            // יצירת המבנה הראשוני
            createHouse();
            
            // אנימציה
            animate();
        }
        
        function createHouse() {
            // נקה את המבנה הקודם
            scene.remove(house);
            house = new THREE.Group();
        
            // יצירת חומרים
            const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5, wireframe: false });
            const panelEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
            const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xAA7755 });
        
            // יצירת קירות
            createWalls(wallMaterial, panelEdgeMaterial);
        
            // יצירת גג
            createRoof(roofMaterial, panelEdgeMaterial);
        
            // הוספת דלת וחלונות
            createDoorAndWindows();
        
            // הוספת המבנה לסצנה
            scene.add(house);
        
            // עדכון חישובי הפאנלים
            updatePanelCalculations();
        }
        
        function createWalls(wallMaterial, edgeMaterial) {
            // מספר הפאנלים לפי גודל המבנה
            const widthPanels = Math.ceil(buildingWidth / panelSize);
            const lengthPanels = Math.ceil(buildingLength / panelSize);
            const heightPanels = Math.ceil(buildingHeight / panelSize);
            
            // צור את הקירות
            for (let x = 0; x < widthPanels; x++) {
                for (let y = 0; y < heightPanels; y++) {
                    // קיר קדמי
                    createPanel(
                        x * panelSize - buildingWidth/2 + panelSize/2, 
                        y * panelSize + panelSize/2,
                        -buildingLength/2,
                        panelSize,
                        wallMaterial,
                        edgeMaterial,
                        new THREE.Vector3(0, 0, 1)
                    );
                    
                    // קיר אחורי
                    createPanel(
                        x * panelSize - buildingWidth/2 + panelSize/2, 
                        y * panelSize + panelSize/2,
                        buildingLength/2,
                        panelSize,
                        wallMaterial,
                        edgeMaterial,
                        new THREE.Vector3(0, 0, -1)
                    );
                }
            }
            
            for (let z = 0; z < lengthPanels; z++) {
                for (let y = 0; y < heightPanels; y++) {
                    // קיר שמאלי
                    createPanel(
                        -buildingWidth/2,
                        y * panelSize + panelSize/2,
                        z * panelSize - buildingLength/2 + panelSize/2,
                        panelSize,
                        wallMaterial,
                        edgeMaterial,
                        new THREE.Vector3(1, 0, 0)
                    );
                    
                    // קיר ימני
                    createPanel(
                        buildingWidth/2,
                        y * panelSize + panelSize/2,
                        z * panelSize - buildingLength/2 + panelSize/2,
                        panelSize,
                        wallMaterial,
                        edgeMaterial,
                        new THREE.Vector3(-1, 0, 0)
                    );
                }
            }
        }
        
        function createRoof(roofMaterial, edgeMaterial) {
            // חישוב גובה שיא הגג
            const radians = THREE.MathUtils.degToRad(roofAngle);
            const roofPeakHeight = (buildingWidth / 2) * Math.tan(radians);
            
            // יצירת גג משולש
            const roofGeometry1 = new THREE.BufferGeometry();
            const vertices1 = new Float32Array([
                -buildingWidth/2, buildingHeight, -buildingLength/2,
                buildingWidth/2, buildingHeight, -buildingLength/2,
                0, buildingHeight + roofPeakHeight, -buildingLength/2,
                
                -buildingWidth/2, buildingHeight, buildingLength/2,
                buildingWidth/2, buildingHeight, buildingLength/2,
                0, buildingHeight + roofPeakHeight, buildingLength/2
            ]);
            
            const indices1 = [
                0, 2, 1,
                3, 5, 4
            ];
            
            roofGeometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
            roofGeometry1.setIndex(indices1);
            roofGeometry1.computeVertexNormals();
            
            const roofFront = new THREE.Mesh(roofGeometry1, roofMaterial);
            house.add(roofFront);
            
            // צדדי הגג
            const roofGeometry2 = new THREE.BufferGeometry();
            const vertices2 = new Float32Array([
                -buildingWidth/2, buildingHeight, -buildingLength/2,
                0, buildingHeight + roofPeakHeight, -buildingLength/2,
                -buildingWidth/2, buildingHeight, buildingLength/2,
                0, buildingHeight + roofPeakHeight, buildingLength/2,
                
                0, buildingHeight + roofPeakHeight, -buildingLength/2,
                buildingWidth/2, buildingHeight, -buildingLength/2,
                0, buildingHeight + roofPeakHeight, buildingLength/2,
                buildingWidth/2, buildingHeight, buildingLength/2
            ]);
            
            const indices2 = [
                0, 1, 2,
                1, 3, 2,
                4, 6, 5,
                6, 7, 5
            ];
            
            roofGeometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
            roofGeometry2.setIndex(indices2);
            roofGeometry2.computeVertexNormals();
            
            const roofSides = new THREE.Mesh(roofGeometry2, roofMaterial);
            house.add(roofSides);
            
            // ייצוג הפאנלים של הגג
            const leftRoofWidth = Math.sqrt(Math.pow(buildingWidth/2, 2) + Math.pow(roofPeakHeight, 2));
            const rightRoofWidth = leftRoofWidth;
            
            const leftPanelsX = Math.ceil(leftRoofWidth / panelSize);
            const rightPanelsX = Math.ceil(rightRoofWidth / panelSize);
            const lengthPanels = Math.ceil(buildingLength / panelSize);
            
            // יצירת קווי הדגשה לפאנלים של הגג
            const roofAngleRad = THREE.MathUtils.degToRad(roofAngle);
            const normalLeft = new THREE.Vector3(Math.sin(roofAngleRad), Math.cos(roofAngleRad), 0);
            const normalRight = new THREE.Vector3(-Math.sin(roofAngleRad), Math.cos(roofAngleRad), 0);
            
            const edgeGroup = new THREE.Group();
            house.add(edgeGroup);
            
            // קווי פאנלים אופקיים
            for (let i = 1; i < lengthPanels; i++) {
                const z = -buildingLength/2 + i * panelSize;
                
                const leftEdgeGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-buildingWidth/2, buildingHeight, z),
                    new THREE.Vector3(0, buildingHeight + roofPeakHeight, z)
                ]);
                
                const rightEdgeGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, buildingHeight + roofPeakHeight, z),
                    new THREE.Vector3(buildingWidth/2, buildingHeight, z)
                ]);
                
                const leftEdge = new THREE.Line(leftEdgeGeometry, edgeMaterial);
                const rightEdge = new THREE.Line(rightEdgeGeometry, edgeMaterial);
                
                edgeGroup.add(leftEdge);
                edgeGroup.add(rightEdge);
            }
        }
        
        function createPanel(x, y, z, size, material, edgeMaterial, normal) {
            const panelGeometry = new THREE.PlaneGeometry(size, size);
            const panel = new THREE.Mesh(panelGeometry, material);
            
            // נורמל להפניית הפאנל בכיוון הנכון
            panel.lookAt(normal);
            
            // מיקום הפאנל
            panel.position.set(x, y, z);
            
            // יצירת מסגרת לפאנל
            const edges = new THREE.EdgesGeometry(panelGeometry);
            const line = new THREE.LineSegments(edges, edgeMaterial);
            panel.add(line);
            
            house.add(panel);
        }
        
        function createDoorAndWindows() {
            const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });
        
            // יצירת דלת
            const doorPosition = document.getElementById('door-position').value;
            const doorOffset = parseFloat(document.getElementById('door-offset').value);
            
            if (doorPosition !== 'none') {
                const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
                const door = new THREE.Mesh(doorGeometry, doorMaterial);
                
                // מיקום הדלת בהתאם לבחירה
                switch(doorPosition) {
                    case 'front':
                        door.position.set(doorOffset - buildingWidth/2, 1, -buildingLength/2 - 0.05);
                        break;
                    case 'back':
                        door.position.set(doorOffset - buildingWidth/2, 1, buildingLength/2 + 0.05);
                        door.rotateY(Math.PI);
                        break;
                    case 'left':
                        door.position.set(-buildingWidth/2 - 0.05, 1, doorOffset - buildingLength/2);
                        door.rotateY(-Math.PI/2);
                        break;
                    case 'right':
                        door.position.set(buildingWidth/2 + 0.05, 1, doorOffset - buildingLength/2);
                        door.rotateY(Math.PI/2);
                        break;
                }
                house.add(door);
            }
        
            // יצירת חלונות
            const windowsList = document.querySelectorAll('.window-item');
            windowsList.forEach(windowItem => {
                const wall = windowItem.querySelector('.window-wall').value;
                const size = parseFloat(windowItem.querySelector('.window-size').value);
                const offset = parseFloat(windowItem.querySelector('.window-offset').value);
                const height = parseFloat(windowItem.querySelector('.window-height').value);
        
                const windowGeometry = new THREE.BoxGeometry(size, size, 0.1);
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
        
                switch(wall) {
                    case 'front':
                        window.position.set(offset - buildingWidth/2, height, -buildingLength/2 - 0.05);
                        break;
                    case 'back':
                        window.position.set(offset - buildingWidth/2, height, buildingLength/2 + 0.05);
                        window.rotateY(Math.PI);
                        break;
                    case 'left':
                        window.position.set(-buildingWidth/2 - 0.05, height, offset - buildingLength/2);
                        window.rotateY(-Math.PI/2);
                        break;
                    case 'right':
                        window.position.set(buildingWidth/2 + 0.05, height, offset - buildingLength/2);
                        window.rotateY(Math.PI/2);
                        break;
                }
                house.add(window);
            });
        }
        
        // Add window management functions
        function initWindowControls() {
            document.getElementById('add-window').addEventListener('click', () => {
                const template = document.querySelector('.window-item').cloneNode(true);
                document.getElementById('windows-list').appendChild(template);
                template.querySelector('.remove-window').addEventListener('click', (e) => {
                    e.target.closest('.window-item').remove();
                    createHouse();
                });
                createHouse();
            });
        
            // Add event listener for initial remove button
            document.querySelector('.remove-window').addEventListener('click', (e) => {
                if (document.querySelectorAll('.window-item').length > 1) {
                    e.target.closest('.window-item').remove();
                    createHouse();
                }
            });
        
            // Add event listeners for all inputs
            ['door-position', 'door-offset'].forEach(id => {
                document.getElementById(id).addEventListener('change', () => createHouse());
            });
        }
        
        // Call initWindowControls after the DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            initWindowControls();
        });
        
        function updatePanelCalculations() {
            // חישוב כמות הפאנלים הנדרשת
            const widthPanels = Math.ceil(buildingWidth / panelSize);
            const lengthPanels = Math.ceil(buildingLength / panelSize);
            const heightPanels = Math.ceil(buildingHeight / panelSize);
        
            // הפאנלים לקירות
            const frontWallPanels = widthPanels * heightPanels;
            const sideWallPanels = lengthPanels * heightPanels;
            const wallPanels = (frontWallPanels * 2) + (sideWallPanels * 2);
        
            // חישוב גובה שיא הגג
            const radians = THREE.MathUtils.degToRad(roofAngle);
            const roofPeakHeight = (buildingWidth / 2) * Math.tan(radians);
            const roofLength = Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(roofPeakHeight, 2));
        
            // הפאנלים לגג
            const roofWidthPanels = Math.ceil(roofLength / panelSize);
            const roofPanels = roofWidthPanels * lengthPanels * 2;
        
            // הפאנלים לחלונות ודלתות
            const windowCount = document.querySelectorAll('.window-item').length;
            const doorExists = document.getElementById('door-position').value !== 'none';
            const doorWindowPanels = windowCount + (doorExists ? 1 : 0);
                
            // הניצבים הנדרשים
            const verticalSupports = (widthPanels + 1) * 2 + (lengthPanels + 1) * 2;
        
            // חישוב מחירים
            const wallPanelPrice = parseFloat(document.getElementById('wall-panel-price').value);
            const roofPanelPrice = parseFloat(document.getElementById('roof-panel-price').value);
            const supportPrice = parseFloat(document.getElementById('support-price').value);
        
            const wallPanelsCost = wallPanels * wallPanelPrice;
            const roofPanelsCost = roofPanels * roofPanelPrice;
            const supportsCost = verticalSupports * supportPrice;
        
            const totalCost = wallPanelsCost + roofPanelsCost + supportsCost;
        
            // עדכון הטבלה
            document.getElementById('summary-table').innerHTML = `
            <tr>
                <td>פאנלים לקירות</td>
                <td>${panelSize * 100}×${panelSize * 100}</td>
                <td>${wallPanels}</td>
                <td>${wallPanelsCost.toFixed(2)} ₪</td>
            </tr>
            <tr>
                <td>פאנלים לגג</td>
                <td>${panelSize * 100}×${panelSize * 100}</td>
                <td>${roofPanels}</td>
                <td>${roofPanelsCost.toFixed(2)} ₪</td>
            </tr>
            <tr>
                <td>ניצבים</td>
                <td>-</td>
                <td>${verticalSupports}</td>
                <td>${supportsCost.toFixed(2)} ₪</td>
            </tr>
            <tr>
                <td>פתחים (דלת וחלונות)</td>
                <td>-</td>
                <td>${doorWindowPanels}</td>
                <td>-</td>
            </tr>
            <tr>
                <td colspan="3">סה"כ עלות</td>
                <td>${totalCost.toFixed(2)} ₪</td>
            </tr>
        `;
        
            // עדכון סך הכל
            document.getElementById('total-panels').textContent = 
        wallPanels + roofPanels + verticalSupports - doorWindowPanels;
}
        
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        
        // התחלת הסצנה אחרי טעינת העמוד
        window.addEventListener('load', () => {
            initScene();
            
            // הוספת אירועים לכפתורים ושדות קלט
            document.getElementById('calculate-btn').addEventListener('click', () => {
                buildingWidth = parseFloat(document.getElementById('width').value);
                buildingLength = parseFloat(document.getElementById('length').value);
                buildingHeight = parseFloat(document.getElementById('height').value);
                roofAngle = parseInt(document.getElementById('roof-angle').value);
                
                createHouse();
            });
            
            document.getElementById('roof-angle').addEventListener('input', (e) => {
                document.getElementById('roof-angle-value').textContent = e.target.value + '°';
                roofAngle = parseInt(e.target.value);
                createHouse();
            });
            
            document.getElementById('size-small').addEventListener('click', () => {
                panelSize = 0.5;
                document.getElementById('size-small').classList.add('active');
                document.getElementById('size-large').classList.remove('active');
                createHouse();
            });
            
            document.getElementById('size-large').addEventListener('click', () => {
                panelSize = 1;
                document.getElementById('size-large').classList.add('active');
                document.getElementById('size-small').classList.remove('active');
                createHouse();
            });
        });
        
        // התאמת הגודל בעת שינוי גודל החלון
        window.addEventListener('resize', () => {
            camera.aspect = document.getElementById('scene-container').clientWidth / document.getElementById('scene-container').clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(
                document.getElementById('scene-container').clientWidth, 
                document.getElementById('scene-container').clientHeight
            );
        });