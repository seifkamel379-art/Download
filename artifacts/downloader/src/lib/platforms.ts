import {
  SiYoutube,
  SiTiktok,
  SiFacebook,
  SiInstagram,
  SiX,
  SiVimeo,
  SiTwitch,
  SiSoundcloud,
  SiReddit,
  SiDailymotion,
  SiPinterest,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import type { IconType } from "react-icons";

export interface Platform {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  textColor: string;
  match: RegExp;
  example: string;
  gradient?: string;
}

export const platforms: Platform[] = [
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    textColor: "#FFFFFF",
    match: /youtube\.com|youtu\.be/i,
    example: "https://youtube.com/watch?v=...",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    textColor: "#FFFFFF",
    match: /tiktok\.com/i,
    example: "https://www.tiktok.com/@user/video/...",
    gradient: "linear-gradient(135deg, #25F4EE 0%, #000000 50%, #FE2C55 100%)",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    textColor: "#FFFFFF",
    match: /facebook\.com|fb\.watch|fb\.com/i,
    example: "https://facebook.com/watch?v=...",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "#E4405F",
    textColor: "#FFFFFF",
    match: /instagram\.com/i,
    example: "https://www.instagram.com/reel/...",
    gradient:
      "linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: SiX,
    color: "#000000",
    textColor: "#FFFFFF",
    match: /twitter\.com|x\.com/i,
    example: "https://x.com/user/status/...",
  },
  {
    id: "vimeo",
    name: "Vimeo",
    icon: SiVimeo,
    color: "#1AB7EA",
    textColor: "#FFFFFF",
    match: /vimeo\.com/i,
    example: "https://vimeo.com/...",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: SiTwitch,
    color: "#9146FF",
    textColor: "#FFFFFF",
    match: /twitch\.tv/i,
    example: "https://www.twitch.tv/videos/...",
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    icon: SiSoundcloud,
    color: "#FF5500",
    textColor: "#FFFFFF",
    match: /soundcloud\.com/i,
    example: "https://soundcloud.com/user/track",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: SiReddit,
    color: "#FF4500",
    textColor: "#FFFFFF",
    match: /reddit\.com|redd\.it/i,
    example: "https://www.reddit.com/r/.../comments/...",
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    icon: SiDailymotion,
    color: "#0066DC",
    textColor: "#FFFFFF",
    match: /dailymotion\.com|dai\.ly/i,
    example: "https://www.dailymotion.com/video/...",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: SiPinterest,
    color: "#E60023",
    textColor: "#FFFFFF",
    match: /pinterest\.com|pin\.it/i,
    example: "https://pinterest.com/pin/...",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: FaLinkedin,
    color: "#0A66C2",
    textColor: "#FFFFFF",
    match: /linkedin\.com/i,
    example: "https://www.linkedin.com/posts/...",
  },
];

export function detectPlatform(url: string): Platform | null {
  if (!url) return null;
  for (const p of platforms) {
    if (p.match.test(url)) return p;
  }
  return null;
}
