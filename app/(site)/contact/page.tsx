'use client'

import Copy from '@/components/Copy'
import { usePageTransition } from '@/components/TransitionContext'

export default function ContactPage() {
  const { handleClose } = usePageTransition()

  return (
    <div className="contact-wrap">
      <div className="contactgrid">
        <div className="contactcolumn">
          <div className="contacttop">
            <Copy animateOnScroll={false} delay={0.3}>
              <h1 className="contacth1">Contact</h1>
            </Copy>
            <Copy animateOnScroll={false} delay={0.4}>
              <h4 className="contacttiming">GMT +3, Georgia</h4>
            </Copy>
            <Copy animateOnScroll={false} delay={0.5} split={false}>
              <div className="tag is-tertiary">
                <p className="label">contact in one hour</p>
              </div>
            </Copy>
          </div>
          <div className="contactbtm">
            <Copy animateOnScroll={false} delay={0.55} split={false}>
              <div className="tag no-padding">
                <p className="label">telegram</p>
              </div>
            </Copy>
            <Copy animateOnScroll={false} delay={0.6}>
              <h4 className="contactlink contactmargin-bottom">IgorDsgn</h4>
            </Copy>
            <Copy animateOnScroll={false} delay={0.65} split={false}>
              <div className="tag no-padding">
                <p className="label">mail</p>
              </div>
            </Copy>
            <Copy animateOnScroll={false} delay={0.7}>
              <h4 className="contactlink">kolesnikig25@gmail.com</h4>
            </Copy>
          </div>
        </div>

        <div className="contactcolumn inverse">
          <img src="/images/qr-2.svg" loading="lazy" alt="" />
        </div>

        <div className="contactcolumn">
          <div className="contacttop contactflex-left">
            <Copy animateOnScroll={false} delay={0.5}>
              <button className="label" onClick={handleClose}>close</button>
            </Copy>
          </div>
          <div className="contactbtm contactflex-left">
            <Copy animateOnScroll={false} delay={0.6}>
              <h4 className="contactlink">Download CV</h4>
            </Copy>
          </div>
        </div>
      </div>
    </div>
  )
}
