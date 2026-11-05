import { useEffect, useRef, useState } from "react";

import "./Carousel.css";

const getColumnOffsets = (track) => {
  const trackLeft = track.getBoundingClientRect().left;
  return [...track.children].map((child) => {
    const childRect = child.getBoundingClientRect();
    return track.scrollLeft + childRect.left - trackLeft;
  });
};

const getNearestIndex = (offsets, value) =>
  offsets.reduce(
    (nearest, offset, index) =>
      Math.abs(offset - value) < Math.abs(offsets[nearest] - value) ? index : nearest,
    0
  );

export default function Carousel({ label, className = "", children }) {
  const trackRef = useRef(null);
  const dragRef = useRef({ pointerId: null, startX: 0, startScroll: 0, moved: false });
  const dragFrameRef = useRef(0);
  const dragTargetRef = useRef(0);
  const suppressClickUntilRef = useRef(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const updateControls = () => {
      setCanScrollPrev(track.scrollLeft > 4);
      setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    };

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, []);

  const scrollCards = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const offsets = getColumnOffsets(track);
    if (!offsets.length) return;

    const currentIndex = getNearestIndex(offsets, track.scrollLeft);
    const targetIndex = Math.min(
      Math.max(currentIndex + direction, 0),
      offsets.length - 1
    );

    track.scrollTo({ left: offsets[targetIndex], behavior: "smooth" });
  };

  const finishDrag = () => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || drag.pointerId === null) return;

    if (dragFrameRef.current) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = 0;
      track.scrollLeft = dragTargetRef.current;
    }

    if (track.hasPointerCapture(drag.pointerId)) {
      track.releasePointerCapture(drag.pointerId);
    }

    track.style.removeProperty("scroll-behavior");
    track.style.removeProperty("scroll-snap-type");
    dragRef.current = { pointerId: null, startX: 0, startScroll: 0, moved: false };
    setIsDragging(false);

    if (!drag.moved) return;

    suppressClickUntilRef.current = Date.now() + 250;

    const offsets = getColumnOffsets(track);
    if (!offsets.length) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const scrollDelta = track.scrollLeft - drag.startScroll;
    const direction = Math.sign(scrollDelta);
    const startIndex = getNearestIndex(offsets, drag.startScroll);
    const currentIndex = getNearestIndex(offsets, track.scrollLeft);

    let targetIndex = currentIndex;
    if (Math.abs(scrollDelta) > 30) {
      targetIndex =
        direction < 0
          ? Math.min(currentIndex, startIndex - 1)
          : Math.max(currentIndex, startIndex + 1);
    }

    targetIndex = Math.min(Math.max(targetIndex, 0), offsets.length - 1);
    const target = Math.min(Math.max(offsets[targetIndex], 0), maxScroll);

    track.scrollTo({ left: target, behavior: "smooth" });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      moved: false,
    };
    track.setPointerCapture(event.pointerId);
    track.style.scrollBehavior = "auto";
    track.style.scrollSnapType = "none";
    dragTargetRef.current = track.scrollLeft;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.moved = true;
    dragTargetRef.current = drag.startScroll - distance;

    if (dragFrameRef.current) return;

    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = 0;
      if (trackRef.current && dragRef.current.pointerId !== null) {
        trackRef.current.scrollLeft = dragTargetRef.current;
      }
    });
  };

  const handleClickCapture = (event) => {
    if (Date.now() >= suppressClickUntilRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={`carousel ${className}`.trim()}>
      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-btn"
          onClick={() => scrollCards(-1)}
          disabled={!canScrollPrev}
          aria-label={`Previous ${label}`}
        >
          &larr;
        </button>
        <button
          type="button"
          className="carousel-btn"
          onClick={() => scrollCards(1)}
          disabled={!canScrollNext}
          aria-label={`Next ${label}`}
        >
          &rarr;
        </button>
      </div>

      <div
        className={`carousel-track${isDragging ? " is-dragging" : ""}`}
        ref={trackRef}
        tabIndex={0}
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </div>
    </div>
  );
}
