import { Link } from "react-router-dom";

import Carousel from '../Carousel/Carousel.jsx'
import { PROJECTS, projectImage } from '../Projects/projects.js'
import { getCardImage } from '../Projects/cardImages.js'
import './WorkCarousel.css'

function groupProjects(projects) {
  const tallProjects = projects.filter((project) => project.tall);
  const shortProjects = projects.filter((project) => !project.tall);
  const pairs = [];

  for (let index = 0; index < shortProjects.length; index += 2) {
    pairs.push(shortProjects.slice(index, index + 2));
  }

  if (!tallProjects.length) return pairs;

  const groups = [];
  let pairIndex = 0;

  tallProjects.forEach((project, index) => {
    groups.push([project]);

    const tallRemaining = tallProjects.length - index;
    const pairBatch = Math.ceil((pairs.length - pairIndex) / tallRemaining);

    for (let count = 0; count < pairBatch && pairIndex < pairs.length; count += 1) {
      groups.push(pairs[pairIndex]);
      pairIndex += 1;
    }
  });

  while (pairIndex < pairs.length) {
    groups.push(pairs[pairIndex]);
    pairIndex += 1;
  }

  return groups;
}

const PROJECT_GROUPS = groupProjects(PROJECTS);

function WorkCarousel() {
  return (
    <Carousel label="Projects carousel" className="work-carousel">
      {PROJECT_GROUPS.map((group, groupIndex) => (
        <div
          className={`work-column${group.length > 1 ? " work-column--paired" : ""}`}
          key={group.map((project) => project.slug).join("-")}
        >
          {group.map((project) => {
            const cardImage = getCardImage(project.image);

            return (
              <Link
                to={`/projects/${project.slug}`}
                className="work-card"
                key={project.slug}
                aria-label={`View ${project.title}`}
              >
                <div className="work-card-media">
                  <img
                    src={projectImage(cardImage.src)}
                    alt={project.title}
                    width={cardImage.width}
                    height={cardImage.height}
                    loading={groupIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={groupIndex === 0 ? "high" : "auto"}
                    decoding="async"
                    draggable="false"
                  />
                </div>
                <span className="work-card-caption">{project.caption}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </Carousel>
  );
}

export default WorkCarousel;
