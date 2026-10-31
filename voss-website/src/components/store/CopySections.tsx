import type { CopySection } from '@/lib/website-copy';
export function CopySections({sections,nested=false}:{sections:CopySection[];nested?:boolean}) {
  return <>{sections.map(section=><section key={section.title}>{nested?<h3>{section.title}</h3>:<h2>{section.title}</h2>}{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section>)}</>;
}
