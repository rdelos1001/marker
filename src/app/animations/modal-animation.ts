/**
 * NO SÉ COMO FUNCIONA
 * https://stackoverflow.com/questions/32919631/ionic-custom-modal-animation
 */
 import { AnimationController } from '@ionic/angular';
 export const SwipeToCloseDefaults = {
     MIN_PRESENTING_SCALE: 0.93,
   };
 export const enterFromRightAnimation = (baseEl, presentingEl) => {
     const backdropAnimation = new AnimationController().create()
       .addElement(baseEl.querySelector('ion-backdrop'))
       .fromTo('opacity', 0.01, 'var(--backdrop-opacity)')
       .beforeStyles({
       'pointer-events': 'none'
     })
       .afterClearStyles(['pointer-events']);
     const wrapperAnimation = new AnimationController().create()
       .addElement(baseEl.querySelectorAll('.modal-wrapper, .modal-shadow'))
       .beforeStyles({ 'opacity': 1 })
       .fromTo('transform', 'translateX(100vh)', 'translateX(0vh)');
     const baseAnimation = new AnimationController().create()
       .addElement(baseEl)
       .easing('cubic-bezier(0.32,0.72,0,1)')
       .duration(500)
       .addAnimation(wrapperAnimation);
     if (presentingEl) {
       const isMobile = window.innerWidth < 768;
       const hasCardModal = (presentingEl.tagName === 'ION-MODAL' && presentingEl.presentingElement !== undefined);
       const presentingAnimation = new AnimationController().create()
         .beforeStyles({
         'transform': 'translateX(0)',
         'transform-origin': 'top center',
         'overflow': 'hidden'
       });
       const bodyEl = document.body;
       if (isMobile) {
         /**
          * Fallback for browsers that does not support `max()` (ex: Firefox)
          * No need to worry about statusbar padding since engines like Gecko
          * are not used as the engine for standlone Cordova/Capacitor apps
          */
         const transformOffset = (!CSS.supports('width', 'max(0px, 1px)')) ? '30px' : 'max(30px, var(--ion-safe-area-top))';
         const modalTransform = hasCardModal ? '-10px' : transformOffset;
         const toPresentingScale = SwipeToCloseDefaults.MIN_PRESENTING_SCALE;
         const finalTransform = `translateX(${modalTransform}) scale(${toPresentingScale})`;
         presentingAnimation
           .afterStyles({
           'transform': finalTransform
         })
           .beforeAddWrite(() => bodyEl.style.setProperty('background-color', 'black'))
           .addElement(presentingEl)
           .keyframes([
           { offset: 0, filter: 'contrast(1)', transform: 'translateX(0px) scale(1)', borderRadius: '0px' },
           { offset: 1, filter: 'contrast(0.85)', transform: finalTransform, borderRadius: '10px 10px 0 0' }
         ]);
         baseAnimation.addAnimation(presentingAnimation);
       }
       else {
         baseAnimation.addAnimation(backdropAnimation);
         if (!hasCardModal) {
           wrapperAnimation.fromTo('opacity', '0', '1');
         }
         else {
           const toPresentingScale = (hasCardModal) ? SwipeToCloseDefaults.MIN_PRESENTING_SCALE : 1;
           const finalTransform = `translateX(-10px) scale(${toPresentingScale})`;
           presentingAnimation
             .afterStyles({
             'transform': finalTransform
           })
             .addElement(presentingEl.querySelector('.modal-wrapper'))
             .keyframes([
             { offset: 0, filter: 'contrast(1)', transform: 'translateX(0) scale(1)' },
             { offset: 1, filter: 'contrast(0.85)', transform: finalTransform }
           ]);
           const shadowAnimation =new AnimationController().create()
             .afterStyles({
             'transform': finalTransform
           })
             .addElement(presentingEl.querySelector('.modal-shadow'))
             .keyframes([
             { offset: 0, opacity: '1', transform: 'translateX(0) scale(1)' },
             { offset: 1, opacity: '0', transform: finalTransform }
           ]);
           baseAnimation.addAnimation([presentingAnimation, shadowAnimation]);
         }
       }
     }
     else {
       baseAnimation.addAnimation(backdropAnimation);
     }
     return baseAnimation;
   };
    
 export const leaveToRightAnimation =  (baseEl, presentingEl, duration = 500) => {
     const backdropAnimation = new AnimationController().create()
       .addElement(baseEl.querySelector('ion-backdrop'))
       .fromTo('opacity', 'var(--backdrop-opacity)', 0.0);
     const wrapperAnimation = new AnimationController().create()
       .addElement(baseEl.querySelectorAll('.modal-wrapper, .modal-shadow'))
       .beforeStyles({ 'opacity': 1 })
       .fromTo('transform', 'translateX(0vh)', 'translateX(100vh)');
     const baseAnimation = new AnimationController().create()
       .addElement(baseEl)
       .easing('cubic-bezier(0.32,0.72,0,1)')
       .duration(duration)
       .addAnimation(wrapperAnimation);
     if (presentingEl) {
       const isMobile = window.innerWidth < 768;
       const hasCardModal = (presentingEl.tagName === 'ION-MODAL' && presentingEl.presentingElement !== undefined);
       const presentingAnimation = new AnimationController().create()
         .beforeClearStyles(['transform'])
         .afterClearStyles(['transform'])
         .onFinish(currentStep => {
         // only reset background color if this is the last card-style modal
         if (currentStep !== 1) {
           return;
         }
         presentingEl.style.setProperty('overflow', '');
         const numModals = Array.from(bodyEl.querySelectorAll('ion-modal')).filter(m => m.presentingElement !== undefined).length;
         if (numModals <= 1) {
           bodyEl.style.setProperty('background-color', '');
         }
       });
       const bodyEl = document.body;
       if (isMobile) {
         const transformOffset = (!CSS.supports('width', 'max(0px, 1px)')) ? '30px' : 'max(30px, var(--ion-safe-area-top))';
         const modalTransform = hasCardModal ? '-10px' : transformOffset;
         const toPresentingScale = SwipeToCloseDefaults.MIN_PRESENTING_SCALE;
         const finalTransform = `translateX(${modalTransform}) scale(${toPresentingScale})`;
         presentingAnimation
           .addElement(presentingEl)
           .keyframes([
           { offset: 0, filter: 'contrast(0.85)', transform: finalTransform, borderRadius: '10px 10px 0 0' },
           { offset: 1, filter: 'contrast(1)', transform: 'translateX(0px) scale(1)', borderRadius: '0px' }
         ]);
         baseAnimation.addAnimation(presentingAnimation);
       }
       else {
         baseAnimation.addAnimation(backdropAnimation);
         if (!hasCardModal) {
           wrapperAnimation.fromTo('opacity', '1', '0');
         }
         else {
           const toPresentingScale = (hasCardModal) ? SwipeToCloseDefaults.MIN_PRESENTING_SCALE : 1;
           const finalTransform = `translateX(-10px) scale(${toPresentingScale})`;
           presentingAnimation
             .addElement(presentingEl.querySelector('.modal-wrapper'))
             .afterStyles({
             'transform': 'translate3d(0, 0, 0)'
           })
             .keyframes([
             { offset: 0, filter: 'contrast(0.85)', transform: finalTransform },
             { offset: 1, filter: 'contrast(1)', transform: 'translateX(0) scale(1)' }
           ]);
           const shadowAnimation = new AnimationController().create()
             .addElement(presentingEl.querySelector('.modal-shadow'))
             .afterStyles({
             'transform': 'translateX(0) scale(1)'
           })
             .keyframes([
             { offset: 0, opacity: '0', transform: finalTransform },
             { offset: 1, opacity: '1', transform: 'translateX(0) scale(1)' }
           ]);
           baseAnimation.addAnimation([presentingAnimation, shadowAnimation]);
         }
       }
     }
     else {
       baseAnimation.addAnimation(backdropAnimation);
     }
     return baseAnimation;
   };