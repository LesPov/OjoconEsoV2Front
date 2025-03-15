import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon';

@Injectable({
  providedIn: 'root',
})
export class ModeloIndicador {
  public model?: THREE.Object3D;
  public physicsBody?: CANNON.Body; 
  public boundingBox?: THREE.Box3;
  private animationTime: number = 0;

  /**
   * Carga el modelo GLTF del indicador, lo posiciona, escala y crea el cuerpo físico.
   * @param scene La escena donde se agrega el modelo.
   * @param modelPath Ruta del modelo.
   * @param world Mundo de físicas.
   * @param startPosition Posición inicial.
   * @param verticalOffset Offset vertical (por defecto 10).
   * @param onLoaded Callback opcional que se ejecuta al finalizar la carga.
   */
  loadGLTFModel(
    scene: THREE.Scene,
    modelPath: string,
    world: CANNON.World,
    startPosition?: THREE.Vector3,
    verticalOffset: number = 10,
    onLoaded?: () => void
  ): void {
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        this.model = gltf.scene;
        if (startPosition) {
          this.model.position.copy(startPosition);
        } else {
          this.model.position.set(2.5, 13, 5.5);
        }
        this.model.position.y += verticalOffset;
        this.model.scale.set(0.1, 0.1, 0.1);
        scene.add(this.model);
        console.log('Indicador cargado:', this.model);

        this.boundingBox = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        this.boundingBox.getSize(size);
        const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);

        this.physicsBody = new CANNON.Body({ mass: 0 });
        const boxShape = new CANNON.Box(halfExtents);
        this.physicsBody.addShape(boxShape, new CANNON.Vec3(0, halfExtents.y, 0));
        this.physicsBody.position.set(
          this.model.position.x,
          this.model.position.y,
          this.model.position.z
        );
        world.addBody(this.physicsBody);
        
        if (onLoaded) onLoaded();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% cargado para el indicador');
      },
      (error) => {
        console.error('Error al cargar el modelo GLTF del indicador:', error);
      }
    );
  }

  /**
   * Actualiza la animación del indicador.
   * @param delta Tiempo transcurrido.
   * @param activeCamera La cámara activa.
   */
  update(delta: number, activeCamera: THREE.Camera): void {
    if (this.model) {
      this.animationTime += delta;
      // Rotación continua
      this.model.rotation.y += delta * (Math.PI / 2);

      // Efecto pulsante (escala)
      const baseScale = 0.3;
      const amplitude = 0.3;
      const pulsateScale = baseScale + amplitude * Math.sin(2 * this.animationTime);

      // Ajuste de escala en función de la distancia a la cámara
      const indicatorPos = new THREE.Vector3();
      this.model.getWorldPosition(indicatorPos);
      const camPos = new THREE.Vector3();
      activeCamera.getWorldPosition(camPos);
      const distance = indicatorPos.distanceTo(camPos);

      const minDistance = 5;
      const maxDistance = 60;
      const minFactor = 0.1;
      const maxFactor = 0.8;
      let distanceFactor: number;
      if (distance <= minDistance) {
        distanceFactor = minFactor;
      } else if (distance >= maxDistance) {
        distanceFactor = maxFactor;
      } else {
        const t = (distance - minDistance) / (maxDistance - minDistance);
        distanceFactor = THREE.MathUtils.lerp(minFactor, maxFactor, t);
      }

      const finalScale = pulsateScale * distanceFactor;
      this.model.scale.set(finalScale, finalScale, finalScale);
    }
  }
}
