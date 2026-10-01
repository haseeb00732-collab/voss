import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import {CATALOGUE,coverImage,coverSrcSet} from '@/lib/catalogue';
import {igDirectMessage,igProfile,IG_HANDLE} from '@/lib/instagram';

export function InstagramStudio(){
  return <section className="v-instagram-studio" aria-labelledby="instagram-heading">
    <div className="v-instagram-creative" aria-label="The VOSS colour edit">
      {[CATALOGUE[1],CATALOGUE[0],CATALOGUE[7]].map((piece,i)=><Link className={`v-instagram-tile v-instagram-tile-${i}`} href={`/collection/${piece.slug}`} key={piece.slug}>
        <img src={coverImage(piece)} srcSet={coverSrcSet(piece)} sizes="(max-width:760px) 35vw, 20vw" width="1122" height="1402" alt={piece.name} loading="lazy"/>
        <span>{['A little colour.','Everyday texture.','Better together.'][i]} <b><ArrowIcon direction="up-right" /></b></span>
      </Link>)}
    </div>
    <div className="v-instagram-copy"><span className="v-kicker">VOSS on Instagram / @{IG_HANDLE}</span><h2 id="instagram-heading">Found your bag?<br/>Let’s make it yours.</h2><p>Choose your bag and colour here. Send your selection to VOSS on Instagram to confirm availability, delivery and payment.</p><a className="v-text-link" href={igDirectMessage() ?? igProfile()} target="_blank" rel="noreferrer">Message VOSS <span><ArrowIcon direction="up-right" /></span></a><div className="v-instagram-links"><Link href="/bag">Review your bag <ArrowIcon direction="up-right" /></Link><a href={igProfile()} target="_blank" rel="noreferrer">Visit our Instagram <ArrowIcon direction="up-right" /></a></div></div>
  </section>;
}
