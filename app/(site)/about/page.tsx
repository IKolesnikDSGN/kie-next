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
                My name is Igor and I am a product designer. My mission is to create unique designs, user-friendly interfaces. And attractive interfaces that are not only beautiful but also effective.
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
              <InfoTooltip text="UI/UX Design descriptor">
                <Copy>
                  <h4 className="a-list-item">UI/UX Design</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Web Design descriptor">
                <Copy>
                  <h4 className="a-list-item">Web Design</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Web Development descriptor">
                <Copy>
                  <h4 className="a-list-item">Web Development</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Branding descriptor">
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
              <InfoTooltip text="Art Direction descriptor">
                <Copy>
                  <h4 className="a-list-item is-secondary">Art Direction</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="Design Support descriptor">
                <Copy>
                  <h4 className="a-list-item is-secondary">Design Support</h4>
                </Copy>
              </InfoTooltip>
              <InfoTooltip text="App Design descriptor">
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
                <h4>Start from $1 500</h4>
              </Copy>
              <Copy>
                <p className="a-p">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.</p>
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
                <p className="a-p is-small">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.</p>
              </Copy>
            </div>
            <div style={{ paddingBottom: '20rem' }} className="a-list">
              <Copy>
                <h4>My name is Igor and I am a product designer. My mission is to create unique designs, user-friendly interfaces. And attractive interfaces that are not only beautiful but also effective.</h4>
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
