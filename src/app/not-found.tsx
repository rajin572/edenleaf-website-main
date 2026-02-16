"use client";

import LocaleLink from '@/components/i18n/LocaleLink';

const NotFound = () => {
  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: none;
        }

        html, body {
          height: 100%;
          overflow: hidden;
        }

        body {
          padding: 0;
          margin: 0;
          font-size: 14px;
          line-height: 1;
          background: #ff5014;
          position: relative;
        }

        /* Add background video */
        video.background-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
        }

        /* Dark gradient overlay */
        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, #ff5014, #ff5014);
          z-index: 0;
        }

        label {
          cursor: pointer;
        }

        a {
          margin: 0;
          padding: 0;
          vertical-align: baseline;
          background: transparent;
          text-decoration: none;
          color: #000;
        }

        input, select, button, textarea {
          margin: 0;
          font-size: 100%;
        }

        html, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre,
        a, abbr, acronym, address, big, cite, code, del, dfn, em, font, img, ins, kbd, q, s, samp,
        small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li,
        fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, input {
          border: 0;
          outline: 0;
          font-size: 100%;
          vertical-align: baseline;
          background: transparent;
        }

        .top-header::before {
          content: '';
          display: block;
          width: 100%;
          height: 4px;
          background-repeat: repeat-x;
          background-size: contain;
          position: absolute;
          top: 0;
          left: 0;
          background-color: #ffffff;
        }

        .lamp {
          position: absolute;
          left: 0px;
          right: 0px;
          top: 0px;
          margin: 0px auto;
          width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-origin: center top;
          animation-timing-function: cubic-bezier(0.6, 0, 0.38, 1);
          animation: move 5.1s infinite;
        }

        @keyframes move {
          0% {
            transform: rotate(40deg);
          }
          50% {
            transform: rotate(-40deg);
          }
          100% {
            transform: rotate(40deg);
          }
        }

        .cable {
          width: 8px;
          height: 200px;
          background-color: #ffffff;
        }

        .cover {
          width: 200px;
          height: 80px;
          background: #ffffff;
          border-top-left-radius: 50%;
          border-top-right-radius: 50%;
          position: relative;
          z-index: 200;
        }

        .in-cover {
          width: 100%;
          max-width: 200px;
          height: 20px;
          border-radius: 100%;
          background: #ffffff99;
          position: absolute;
          left: 0px;
          right: 0px;
          margin: 0px auto;
          bottom: -9px;
          z-index: 100;
        }

        .in-cover .bulb {
          width: 50px;
          height: 50px;
          background-color: #ff5014;
          border-radius: 50%;
          position: absolute;
          left: 0px;
          right: 0px;
          bottom: -20px;
          margin: 0px auto;
          box-shadow: 0 0 25px 7px #ffffff99, 0 0 64px 47px rgba(255,255,255,0.5), 0px 0 30px 15px rgba(255,255,255,0.2);
        }

        .light {
          width: 200px;
          height: 0px;
          border-bottom: 900px solid rgb(255 255 255 / 50%);
          border-left: 50px solid transparent;
          border-right: 50px solid transparent;
          position: absolute;
          left: 0px;
          right: 0px;
          top: 270px;
          margin: 0px auto;
          z-index: 1;
          border-radius: 90px 90px 0px 0px;
        }

        .error {
          min-height: 100vh;
          position: relative;
          padding: 240px 0;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          text-align: center;
          margin-top: 70px;
        }

        .error__content {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          transform: translate(-50%, -50%);
        }

        .error__message {
          text-align: center;
          color: #ffffff;
        }

        .message__title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 5px;
          margin:0px auto 20px;
        }

        .message__text {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          padding: 0 60px;
          max-width: 680px;
          color: #ffffff66;
          margin:0px auto 16px;
        }

        .error__nav {
          max-width: 600px;
          margin: 40px auto 0;
          text-align: center;
        }

        button{
          cursor: pointer;
          display: inline-block;
          vertical-align: top;
          width: 170px;
          height: 45px;
          border: 1px solid #ffffff;
          color: #ffffff;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: .1rem;
          position: relative;
          overflow: hidden;
          background-color: transparent;
          margin:  15px 0 ;

        }

        .e-nav__link {
          height: 45px;
          line-height: 45px;
          width: 170px;
          display: inline-block;
          vertical-align: top;
          margin: 0 15px ;
          border: 1px solid #ffffff;
          color: #ffffff;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: .1rem;
          position: relative;
          overflow: hidden;
        }

        .e-nav__link:hover {
          color: #ffffff;
        }

        button.back-link {
          position: relative;
          width: auto;
          height: auto;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 10px 4px 12px;
          margin: 20px auto 0;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: color 0.25s ease;
        }

        button.back-link:hover {
          color: #ffffff;
        }

        button.back-link::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 4px;
          width: 0;
          height: 1px;
          background: #ffffff;
          transition: width 0.3s ease, left 0.3s ease;
        }

        button.back-link:hover::after {
          width: 70%;
          left: 15%;
        }

        .back-link__arrow {
          display: inline-block;
          font-size: 15px;
          line-height: 1;
          transition: transform 0.25s ease;
        }

        button.back-link:hover .back-link__arrow {
          transform: translateX(-5px);
        }
      `}</style>

      {/* Background Video */}
      <video className="background-video" autoPlay loop muted>
        <source src="/assets/video/notFound.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay */}
      <div className="video-overlay"></div>

      <header className="top-header"></header>

      {/* Dust particle */}
      <div>
        <div className="starsec"></div>
        <div className="starthird"></div>
        <div className="starfourth"></div>
        <div className="starfifth"></div>
      </div>

      <div className="lamp__wrap">
        <div className="lamp">
          <div className="cable"></div>
          <div className="cover"></div>
          <div className="in-cover">
            <div className="bulb"></div>
          </div>
          <div className="light"></div>
        </div>
      </div>

      <section className="error">
        {/* Content */}
        <div className="error__content">
          <div className="error__message message">
            <h1 className="message__title text-3xl! sm:text-4xl! md:text-5xl! lg:text-6xl! xl:text-7xl!">
              Page Not Found
            </h1>
            <p className="message__text  mb-10">
              We&apos;re sorry, the page you were looking for isn&apos;t found
              here. The link you followed may either be broken or no longer
              exists. Please try again, or take a look at our home page.
            </p>
          </div>
          <LocaleLink href="/">
            <button
              className="text-secondary-color"
            >
              Back to Home
            </button>
          </LocaleLink>
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="back-link"
            >
              <span className="back-link__arrow" aria-hidden>←</span>
              <span>Back to previous page</span>
            </button>
          </div>
        </div>
        {/* END Content */}
      </section>
    </>
  );
};

export default NotFound;