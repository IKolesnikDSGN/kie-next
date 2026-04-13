import Copy from '@/components/Copy'

export default function IndexPage() {
  return (
    <div className="index-wrap">
      <Copy animateOnScroll={false} delay={0.65}>
        <h1 className="index-headline">
          Branding, digital design<br></br>& development
        </h1>
      </Copy>
      <Copy animateOnScroll={false} delay={0.75}>
        <p className="index-subtext">
          For small – medium businesses, startups, and fellow professionals striving for growth and new opportunities
        </p>
      </Copy>
    </div>
  )
}
