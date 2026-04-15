import Image from 'next/image'
import Copy from '@/components/Copy'
import SmoothScroll from '@/components/SmoothScroll'
import PosterLogo from '@/components/PosterLogo'
import InfoTooltip from '@/components/InfoTooltip'
import MoscowTime from '@/components/MoscowTime'
import { client } from '@/lib/sanity'

type SkillItem = { name: string; iconUrl: string | null }

async function getSiteData() {
  const data = await client.fetch<{
    bgUrl: string | null
    fgUrl: string | null
    skills: SkillItem[]
  }>(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{
      "bgUrl": posterBgImage.asset->url,
      "fgUrl": posterFgImage.asset->url,
      "skills": skills[]{
        "name": name,
        "iconUrl": icon.asset->url
      }
    }`,
    {},
    { next: { revalidate: 60 } }
  )
  return {
    bgUrl: data?.bgUrl ?? '/images/site-1.png',
    fgUrl: data?.fgUrl ?? '/images/site.png',
    skills: data?.skills ?? [],
  }
}

export default async function AboutPage() {
  const { bgUrl, fgUrl, skills } = await getSiteData()

  return (
    <>
      <div className="about-overlay" />
      <SmoothScroll className="about-wrap">
        <div className="poster-wrap">
          <Image
            className="poster-media"
            src={bgUrl}
            alt=""
            fill
            sizes="(max-width: 1688px) 100vw, 1688px"
            priority
          />
          <div className="poster-logo">
            <PosterLogo />
          </div>
          <Image
            className="poster-media is-forground"
            src={fgUrl}
            alt=""
            fill
            sizes="(max-width: 1688px) 100vw, 1688px"
          />
        </div>

        <div className="about-info-wrap">
          <div className="a-tags">
            <Copy animateOnScroll={false} delay={0.65} split={false}>
              <div className="tag">
                <p className="label">Igor Kolesnik</p>
              </div>
            </Copy>
            <Copy animateOnScroll={false} delay={0.72} split={false}>
              <div className="tag is-tertiary">
                <p className="label">georgia. working worldwide</p>
              </div>
            </Copy>
          </div>

          <div style={{ width: '40rem', marginBottom: '3rem' }}>
            <Copy animateOnScroll={false} delay={0.8}>
              <h2 className="about-h2">
                My name is Igor and I am a designer, developer and brand identity creator. My mission is to craft experiences — from pixel-perfect interfaces to visual identities that leave a lasting impression.
              </h2>
            </Copy>
          </div>

          <div className="a-item">
            <div className="a-tag-wrap">
              <Copy split={false}>
                <div className="tag">
                  <p className="label">Service</p>
                </div>
              </Copy>
            </div>
            <div className="a-list">
              <InfoTooltip text="Intuitive interfaces, backed by research">
                <Copy>
                  <h4 className="a-list-item">UI/UX Design</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Clean layouts that convert and impress">
                <Copy>
                  <h4 className="a-list-item">Web Design</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Webflow or advanced stack — whatever the project demands">
                <Copy>
                  <h4 className="a-list-item">Web Development</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Visual identity that's consistent and impossible to ignore">
                <Copy>
                  <h4 className="a-list-item">Branding</h4>
                </Copy>
              </InfoTooltip>
              <div className="a-list-tag">
                <Copy split={false}>
                  <div className="tag is-tertiary">
                    <p className="label">additional</p>
                  </div>
                </Copy>
              </div>
              <InfoTooltip text="Creative vision across every touchpoint">
                <Copy>
                  <h4 className="a-list-item is-secondary">Art Direction</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="A skilled extra hand when you need to move faster">
                <Copy>
                  <h4 className="a-list-item is-secondary">Design Support</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Native-feeling mobile interfaces, smooth by design">
                <Copy>
                  <h4 className="a-list-item is-secondary">App Design</h4>
                </Copy>
              </InfoTooltip>
            </div>
          </div>

          <div className="a-item">
            <div className="a-tag-wrap">
              <Copy split={false}>
                <div className="tag">
                  <p className="label">price</p>
                </div>
              </Copy>
            </div>
            <div className="a-list">
              <Copy>
                <h4>Start from $2 000</h4>
              </Copy>
              <Copy>
                <p className="a-p">Every project is different — scope, complexity and goals all shape the final number. I don't do one-size-fits-all pricing. After a detailed brief, you get a clear estimate with no surprises. Let's talk about what you need and I'll put together a number that makes sense for both of us.</p>
              </Copy>
            </div>
          </div>

          <div className="a-item">
            <div className="a-tag-wrap">
              <Copy split={false}>
                <div className="tag">
                  <p className="label">skills</p>
                </div>
              </Copy>
            </div>
            <div className="a-grid">
              {skills.map((skill, i) => (
                <div className="skill-item" key={i}>
                  {skill.iconUrl && (
                    <div className="skill-img-wrap">
                      <Image src={skill.iconUrl} alt={skill.name} fill style={{ objectFit: 'contain' }} />
                    </div>
                  )}
                  <div className="skill-descriptor">
                    <Copy>
                      <div className="label">{skill.name}</div>
                    </Copy>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="a-item">
            <div className="a-tag-wrap">
              <Copy split={false}>
                <div className="tag">
                  <p className="label">about</p>
                </div>
              </Copy>
              <Copy>
                <p className="a-p is-small">I started as an engineer, which shaped the way I think about design — systematically, with attention to every detail. Today I bring that same precision to interfaces, products and visual identities. When I'm not pushing pixels, I'm probably being judged by my cat. I'm told I'm kind. He disagrees.</p>
              </Copy>
            </div>
            <div style={{ paddingBottom: '20rem' }} className="a-list">
              <Copy>
                <h4>My name is Igor. I design interfaces, build products and craft visual identities. Somewhere between engineering and aesthetics — that's where I do my best work.</h4>
              </Copy>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--_theme---border)', marginTop: '-4rem' }} className="a-divider" />

          <div className="a-item">
            <div className="a-tag-wrap">
              <Copy split={false}>
                <div className="tag">
                  <p className="label">contact</p>
                </div>
              </Copy>
            </div>
            <div className="a-list">
              <MoscowTime />
              <div className="a-list-tag">
                <Copy split={false}>
                  <div className="tag is-tertiary">
                    <p className="label">telegram</p>
                  </div>
                </Copy>
              </div>
              <Copy>
                <a href="https://t.me/IgorDsgn" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <h4 className="a-list-item">IgorDsgn</h4>
                </a>
              </Copy>
              <div className="a-list-tag">
                <Copy split={false}>
                  <div className="tag is-tertiary">
                    <p className="label">email</p>
                  </div>
                </Copy>
              </div>
              <Copy>
                <a href="mailto:kolesnikig25@gmail.com" style={{ textDecoration: 'none' }}>
                  <h4 className="a-list-item">kolesnikig25@gmail.com</h4>
                </a>
              </Copy>
            </div>
          </div>

          <div className="a-btm">
            <Copy split={false}>
              <div className="tag is-tertiary">
                <p className="label">{new Date().getFullYear()}</p>
              </div>
            </Copy>
            <Copy split={false}>
              <div className="tag is-tertiary">
                <p className="label">all rights reserved</p>
              </div>
            </Copy>
          </div>
        </div>
      </SmoothScroll>
    </>
  )
}
