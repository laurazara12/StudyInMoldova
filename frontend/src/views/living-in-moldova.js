import React, { Fragment } from 'react'

import { Helmet } from 'react-helmet'

import Navbar from '../components/navbar'
import LivingInMoldova1 from '../components/living-in-moldova1'
import Footer from '../components/footer'
import './living-in-moldova.css'

const LivingInMoldova = (props) => {
  return (
    <div className="living-in-moldova-container">
      <Helmet>
        <title>LivingInMoldova - exported project</title>
        <meta
          property="og:title"
          content="LivingInMoldova - exported project"
        />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="living-in-moldova-text100">Study In Moldova</span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="living-in-moldova-text101">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="living-in-moldova-text102">Living In Moldova</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="living-in-moldova-text103">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="living-in-moldova-text104">Help You Choose</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="living-in-moldova-text105">Universities</span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="living-in-moldova-text106">Plan Your Studies</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="living-in-moldova-text107">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="living-in-moldova-text108">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="living-in-moldova-text109">Features</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="living-in-moldova-text110">Pricing</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="living-in-moldova-text111">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="living-in-moldova-text112">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="living-in-moldova-text113">Register</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="living-in-moldova-text114">Register</span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name8"
      ></Navbar>
      <LivingInMoldova1
        heading1={
          <Fragment>
            <span className="living-in-moldova-text115">Living In Moldova</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="living-in-moldova-text116">
              Discover essential information before starting your jurney.
            </span>
          </Fragment>
        }
        content2={
          <Fragment>
            <span className="living-in-moldova-text117">
              Do not hesitate to contact for any topic we might have missed !
            </span>
          </Fragment>
        }
        heading2={
          <Fragment>
            <span className="living-in-moldova-text118">
              Do you have a particular question?
            </span>
          </Fragment>
        }
        action1={
          <Fragment>
            <span className="living-in-moldova-text119">Contact</span>
          </Fragment>
        }
        info1={
          <Fragment>
            <span className="living-in-moldova-text120">
              <span>
                Moldova is one of the most affordable countries in Europe for
                students. A student’s monthly expenses, including rent, food,
                transport, and leisure, range between €300-€600.
              </span>
              <br></br>
              <br></br>
              <span>
                Rent: €100-€300/month (shared or dormitory housing is cheaper)
              </span>
              <br></br>
              <span>Food: €100-€200/month</span>
              <br></br>
              <span>
                Transport: €5-€15/month (public transport is very cheap)
              </span>
              <br></br>
              <span>Leisure &amp; entertainment: €50-€150/month</span>
              <br></br>
              <span>
                👉 Tip: Students can save money by shopping at local markets and
                using public transport.
              </span>
            </span>
          </Fragment>
        }
        info2={
          <Fragment>
            <span className="living-in-moldova-text133">Cost of Living</span>
          </Fragment>
        }
        info2Title={
          <Fragment>
            <span className="living-in-moldova-text134">Transportation</span>
          </Fragment>
        }
        info4={
          <Fragment>
            <span className="living-in-moldova-text135">
              <span>
                International students can work part-time while studying, but
                job options are limited if you don’t speak Romanian or Russian.
              </span>
              <br></br>
              <br></br>
              <span>
                Part-time jobs: Tutoring, freelance work, hospitality (cafés,
                restaurants).
              </span>
              <br></br>
              <span>
                Internships: Some universities offer career services to help
                students find work experience.
              </span>
              <br></br>
              <span>
                Work after graduation: Some students stay in Moldova to work,
                especially in IT, healthcare, and business sectors.
              </span>
              <br></br>
              <span>
                👉 Tip: Consider learning basic Romanian or Russian to increase
                job opportunities!
              </span>
            </span>
          </Fragment>
        }
        info4Title={
          <Fragment>
            <span className="living-in-moldova-text146">
              Work &amp; Career Opportunities
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        info3={
          <Fragment>
            <span className="living-in-moldova-text147">
              <span>
                Moldovan cuisine is a delicious mix of Eastern European and
                Balkan flavors.
              </span>
              <br></br>
              <br></br>
              <span>Affordable student meals: €2-€5 at local restaurants</span>
              <br></br>
              <span>Popular dishes:</span>
              <br></br>
              <span>
                Mămăligă (cornmeal porridge, often served with cheese &amp; sour
                cream)
              </span>
              <br></br>
              <span>
                Plăcinte (savory pastries filled with cheese, potatoes, or
                cabbage)
              </span>
              <br></br>
              <span>Sarmale (stuffed cabbage rolls)</span>
              <br></br>
              <span>
                🛒 Grocery shopping: Supermarkets like Linella, Nr. 1, and
                Kaufland offer budget-friendly prices.
              </span>
            </span>
          </Fragment>
        }
        info3Title={
          <Fragment>
            <span className="living-in-moldova-text162">Food &amp; Dining</span>
          </Fragment>
        }
        info6={
          <Fragment>
            <span className="living-in-moldova-text163">
              <span>Students in Moldova can choose between:</span>
              <br></br>
              <br></br>
              <span>
                University dormitories – Affordable (€50-€100/month) but with
                shared facilities.
              </span>
              <br></br>
              <span>
                Private rentals – Apartments range from €150-€400/month
                depending on location and size.
              </span>
              <br></br>
              <span>Shared apartments – A popular option to save on rent.</span>
              <br></br>
              <span>
                📌 Chișinău, the capital, has the highest rental costs, while
                smaller cities offer cheaper housing.
              </span>
            </span>
          </Fragment>
        }
        info22={
          <Fragment>
            <span className="living-in-moldova-text174">
              <span>
                Moldova has an affordable and efficient public transport system.
              </span>
              <br></br>
              <br></br>
              <span>
                Trolleybuses &amp; buses – Tickets cost €0.20-€0.30 per ride.
              </span>
              <br></br>
              <span>
                Minibuses (marshrutkas) – Faster than buses, costing around
                €0.30 per ride.
              </span>
              <br></br>
              <span>
                Taxis &amp; ride-sharing – Bolt and Yandex Go are popular apps.
              </span>
              <br></br>
              <span>
                🚲 Tip: Walking or biking is easy in cities like Chișinău, where
                most universities are centrally located.
              </span>
            </span>
          </Fragment>
        }
        info62={
          <Fragment>
            <span className="living-in-moldova-text185">
              Accommodation
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        info9Title={
          <Fragment>
            <span className="living-in-moldova-text186">
              Culture &amp; Language
            </span>
          </Fragment>
        }
        info7={
          <Fragment>
            <span className="living-in-moldova-text187">
              <span>
                All international students must have health insurance while
                studying in Moldova.
              </span>
              <br></br>
              <br></br>
              <span>
                Public healthcare is available, but many prefer private clinics
                for faster service.
              </span>
              <br></br>
              <span>
                Private health insurance costs around €50-€150 per year and
                covers most medical services.
              </span>
              <br></br>
              <span>
                💡 Tip: Many universities offer student medical services at
                affordable rates.
              </span>
            </span>
          </Fragment>
        }
        info7Title={
          <Fragment>
            <span className="living-in-moldova-text196">
              Healthcare &amp; Insurance
            </span>
          </Fragment>
        }
        info8={
          <Fragment>
            <span className="living-in-moldova-text197">
              <span>
                Moldova has a vibrant student community with many social,
                cultural, and sports activities.
              </span>
              <br></br>
              <br></br>
              <span>
                Student organizations – Many universities have international
                student clubs.
              </span>
              <br></br>
              <span>
                Events &amp; festivals – Experience Moldovan traditions at
                events like Wine Festival (October) or Martisor Festival
                (March).
              </span>
              <br></br>
              <span>
                Nightlife &amp; cafes – Chișinău has affordable bars, clubs, and
                coffee shops popular among students.
              </span>
              <br></br>
              <span>
                💡 Tip: Join university Facebook groups or Telegram chats to
                meet fellow students!
              </span>
            </span>
          </Fragment>
        }
        info8Title={
          <Fragment>
            <span className="living-in-moldova-text208">
              Student Life &amp; Social Activities
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        info9={
          <Fragment>
            <span className="living-in-moldova-text209">
              <br></br>
              <span>Official language: Romanian</span>
              <br></br>
              <span>
                Other spoken languages: Russian, Gagauz, English (in academic
                settings)
              </span>
              <br></br>
              <span>Cultural sites:</span>
              <br></br>
              <span>Orheiul Vechi – Ancient rock monastery</span>
              <br></br>
              <span>
                Cricova Winery – One of the world’s largest underground wine
                cellars
              </span>
              <br></br>
              <span>
                Chișinău’s museums &amp; theaters – Perfect for history and art
                lovers
              </span>
              <br></br>
              <span>
                💡 Tip: Even though many people speak Russian, learning basic
                Romanian will help with daily life!
              </span>
            </span>
          </Fragment>
        }
      ></LivingInMoldova1>
      <Footer
        link5={
          <Fragment>
            <span className="living-in-moldova-text224">Link 5</span>
          </Fragment>
        }
        action1={
          <Fragment>
            <span className="living-in-moldova-text225">Subscribe</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="living-in-moldova-text226">Subscribe</span>
          </Fragment>
        }
        content3={
          <Fragment>
            <span className="living-in-moldova-text227">
              © 2024
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        link1={
          <Fragment>
            <span className="living-in-moldova-text228">Link 1</span>
          </Fragment>
        }
        privacyLink={
          <Fragment>
            <span className="living-in-moldova-text229">Privacy Policy</span>
          </Fragment>
        }
        cookiesLink={
          <Fragment>
            <span className="living-in-moldova-text230">Cookies Settings</span>
          </Fragment>
        }
        link3={
          <Fragment>
            <span className="living-in-moldova-text231">Link 3</span>
          </Fragment>
        }
        link4={
          <Fragment>
            <span className="living-in-moldova-text232">Link 4</span>
          </Fragment>
        }
        link2={
          <Fragment>
            <span className="living-in-moldova-text233">Link 2</span>
          </Fragment>
        }
        termsLink={
          <Fragment>
            <span className="living-in-moldova-text234">Terms of Service</span>
          </Fragment>
        }
        content2={
          <Fragment>
            <span className="living-in-moldova-text235">
              By subscribing you agree to with our Privacy Policy and provide
              consent to receive updates from our company.
            </span>
          </Fragment>
        }
      ></Footer>
    </div>
  )
}

export default LivingInMoldova
