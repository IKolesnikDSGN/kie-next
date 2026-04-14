'use client'

import Copy from '@/components/Copy'
import { usePageTransition } from '@/components/TransitionContext'

export default function ContactClient({ cvUrl, qrUrl }: { cvUrl: string | null; qrUrl: string | null }) {
  const { handleClose } = usePageTransition()

  return (
    <div className="contact-wrap">
      <div className="contactgrid">
        <div className="contactcolumn">
          <div className="contacttop">
            <Copy animateOnScroll={false} delay={0.3}>
              <h1 className="contacth1">Contact</h1>
            </Copy>
          </div>
          <div className="contactbtm">
            <Copy animateOnScroll={false} delay={0.55} split={false}>
              <div className="tag no-padding">
                <p className="label">telegram</p>
              </div>
            </Copy>
            <Copy animateOnScroll={false} delay={0.6}>
              <a href="https://t.me/IgorDsgn" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <h4 className="contactlink contactmargin-bottom">IgorDsgn</h4>
              </a>
            </Copy>
            <Copy animateOnScroll={false} delay={0.65} split={false}>
              <div className="tag no-padding">
                <p className="label">mail</p>
              </div>
            </Copy>
            <Copy animateOnScroll={false} delay={0.7}>
              <a href="mailto:kolesnikig25@gmail.com" style={{ textDecoration: 'none' }}>
                <h4 className="contactlink">kolesnikig25@gmail.com</h4>
              </a>
            </Copy>
          </div>
        </div>

        <div className="contactcolumn inverse">
          <img src={qrUrl ?? '/images/qr-2.svg'} loading="lazy" alt="" />
        </div>

        <div className="contactcolumn">
          <div className="contacttop contactflex-left">
            <Copy animateOnScroll={false} delay={0.5}>
              <button className="label" onClick={handleClose}>close</button>
            </Copy>
          </div>
          <div className="contactbtm contactflex-left">
            <Copy animateOnScroll={false} delay={0.6}>
              {cvUrl ? (
                <a href={cvUrl} download style={{ textDecoration: 'none' }}>
                  <h4 className="contactlink">Download CV <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block', verticalAlign:'middle', marginLeft:'4px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></h4>
                </a>
              ) : (
                <h4 className="contactlink" style={{ opacity: 0.4 }}>Download CV <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block', verticalAlign:'middle', marginLeft:'4px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></h4>
              )}
            </Copy>
          </div>
        </div>
      </div>
    </div>
  )
}
