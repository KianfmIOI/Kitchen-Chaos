import * as THREE from 'three'

export function createBoundingBox(scene, settings) {

    const box = new THREE.Box3(
        new THREE.Vector3(settings.min.x, settings.min.y, settings.min.z),
        new THREE.Vector3(settings.max.x, settings.max.y, settings.max.z)
    );

    const helper = new THREE.Box3Helper(box, settings.color);

    helper.visible = settings.visible;

    scene.add(helper);

    return { box, helper };
}