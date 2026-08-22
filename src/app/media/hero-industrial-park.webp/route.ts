import part01 from "../../../lib/homeHeroImage/part01";
import part02 from "../../../lib/homeHeroImage/part02";
import part03 from "../../../lib/homeHeroImage/part03";
import part04 from "../../../lib/homeHeroImage/part04";
import part05 from "../../../lib/homeHeroImage/part05";
import part06 from "../../../lib/homeHeroImage/part06";

const HERO_BASE64 = part01 + part02 + part03 + part04 + part05 + part06;
const HERO_IMAGE = Buffer.from(HERO_BASE64, "base64");

export const dynamic = "force-static";

export async function GET() {
  return new Response(HERO_IMAGE, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(HERO_IMAGE.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Licogi-Hero": "uploaded-20260822",
    },
  });
}
