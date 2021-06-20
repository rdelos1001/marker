import { AnimationController ,Animation} from '@ionic/angular';

export const enterAnimation = (baseEl:HTMLElement, opts?:any):Animation =>{
    const DURATION = 500;
    const animationController = new AnimationController();
    
    if(opts.direction==="forward"){
        const rootAnimation =animationController.create()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',1,1)
        .fromTo("transform","translateX(110%)","translateX(0%)")

        const leavingAnimation= animationController.create()
        .addElement(opts.leavingEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',1,1)
        .fromTo("transform","translateX(0)","translateX(-100%)")
        return animationController.create().addAnimation([rootAnimation ,leavingAnimation]);
    }else{
        const rootAnimation =animationController.create()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',1,1)
        .fromTo("transform","translateX(-110%)","translateX(0%)")

        const leavingAnimation= animationController.create()
        .addElement(opts.leavingEl)
        .duration(DURATION)
        .easing("ease-in")
        .fromTo('opacity',1,1)
        .fromTo("transform","translateX(0%)","translateX(100%)")
        return animationController.create().addAnimation([rootAnimation ,leavingAnimation]);

    }
}