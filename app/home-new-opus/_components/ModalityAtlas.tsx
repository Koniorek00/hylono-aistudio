'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import analytics from '@/src/lib/analytics';
import { modalities, type ModalityId } from './content';
import { OpusLink } from './OpusLink';
import s from './opus.module.css';

const HASH_PREFIX = '#atlas-';

const isModalityId = (value: string): value is ModalityId =>
  modalities.some((modality) => modality.id === value);

/**
 * WAI-ARIA tabs pattern with automatic activation: arrow keys move focus and selection,
 * Home/End jump to the ends. Hash links such as #atlas-rlt open a specific panel.
 */
export function ModalityAtlas() {
  const [active, setActive] = useState<ModalityId>('hbot');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith(HASH_PREFIX)) return;
      const id = hash.slice(HASH_PREFIX.length);
      if (isModalityId(id)) setActive(id);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const select = (id: ModalityId, focus = false) => {
    setActive(id);
    analytics.capture('home_modality_card_clicked', {
      route: '/home-new-opus',
      modality: id,
      source: 'modality-atlas-tab',
    });
    if (focus) tabRefs.current[modalities.findIndex((m) => m.id === id)]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = modalities.findIndex((m) => m.id === active);
    const last = modalities.length - 1;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? current === last
          ? 0
          : current + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? current === 0
            ? last
            : current - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    const target = next === null ? undefined : modalities[next];
    if (!target) return;
    event.preventDefault();
    select(target.id, true);
  };

  return (
    <div className={s.atlas} data-active={active}>
      <div
        role="tablist"
        aria-label="Wellness technologies"
        aria-orientation="vertical"
        className={s.atlasTabs}
        onKeyDown={onKeyDown}
      >
        {modalities.map((modality, i) => {
          const selected = modality.id === active;
          return (
            <button
              key={modality.id}
              ref={(node) => {
                tabRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`atlas-tab-${modality.id}`}
              aria-selected={selected}
              aria-controls={`atlas-panel-${modality.id}`}
              tabIndex={selected ? 0 : -1}
              className={s.atlasTab}
              data-modality={modality.id}
              onClick={() => select(modality.id)}
            >
              <span className={s.atlasTabIndex}>{modality.index}</span>
              <span className={s.atlasTabSymbol} aria-hidden="true">
                {modality.symbol}
              </span>
              <span className={s.atlasTabText}>
                <span className={s.atlasTabName}>{modality.name}</span>
                <span className={s.atlasTabLine}>{modality.line}</span>
              </span>
            </button>
          );
        })}
      </div>

      {modalities.map((modality) => (
        <div
          key={modality.id}
          role="tabpanel"
          id={`atlas-panel-${modality.id}`}
          aria-labelledby={`atlas-tab-${modality.id}`}
          hidden={modality.id !== active}
          tabIndex={0}
          className={s.atlasPanel}
          data-modality={modality.id}
        >
          <figure className={s.atlasFigure}>
            <Image
              src={modality.image.src}
              width={modality.image.width}
              height={modality.image.height}
              alt={modality.image.alt}
              sizes="(max-width: 900px) 100vw, 46vw"
              className={s.atlasImage}
            />
            <figcaption className={s.atlasSymbolLarge} aria-hidden="true">
              {modality.symbol}
            </figcaption>
          </figure>
          <div className={s.atlasBody}>
            <p className={s.eyebrow}>
              {modality.index} / {modality.short}
            </p>
            <h3 className={s.atlasTitle}>{modality.name}</h3>
            <p className={s.atlasDescription}>{modality.description}</p>
            <div className={s.atlasChecks}>
              <p className={s.atlasLabel}>Before you choose, check</p>
              <ul>
                {modality.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </div>
            <div className={s.atlasEvidence}>
              <p className={s.atlasLabel}>Evidence, honestly</p>
              <p>{modality.evidence}</p>
            </div>
            <div className={s.atlasActions}>
              <OpusLink href={modality.path} source="modality-atlas" className={s.buttonInk}>
                {modality.action} <span aria-hidden="true">↗</span>
              </OpusLink>
              <OpusLink href="/research" source="modality-atlas-research" className={s.textLink}>
                Read the research <span aria-hidden="true">↗</span>
              </OpusLink>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
