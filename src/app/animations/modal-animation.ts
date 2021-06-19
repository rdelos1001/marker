import { AnimationController ,Animation} from '@ionic/angular';

export const modalAnimation = (baseEl:HTMLElement, opts?:any):Animation =>{
    const DURATION = 500;
    const animationController = new AnimationController();

        const leavingAnimation= animationController.create()
        .addElement(baseEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',1,1)
        .fromTo("transform","translateX(0)","translateX(-100%)")
        return animationController.create().addAnimation(leavingAnimation)
}