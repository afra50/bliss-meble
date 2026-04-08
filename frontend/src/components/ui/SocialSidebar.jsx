import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import "../../styles/components/ui/social-sidebar.scss";

const SocialSidebar = () => {
  return (
    <div className="social-sidebar">
      <a
        href="https://www.facebook.com/profile.php?id=61585843586803&rdid=1muYW7nZuCsrWVan&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BsCWMh6zr#"
        target="_blank"
        rel="noreferrer"
        aria-label="Facebook"
      >
        <FaFacebookF />
      </a>
      <a
        href="https://www.instagram.com/blissmeble"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
      >
        <FaInstagram />
      </a>
      <a
        href="https://www.tiktok.com/@bliss.meble?_r=1&_t=ZN-94zWs1rmuCA"
        target="_blank"
        rel="noreferrer"
        aria-label="TikTok"
      >
        <FaTiktok />
      </a>
    </div>
  );
};

export default SocialSidebar;
