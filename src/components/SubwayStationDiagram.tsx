"use client";

import {
  getSubwayLineBadge,
  getSubwayLineColor,
  getSubwayLineLabel,
} from "../data/subwayLineColors";
import { classifyArrivalSide, type StationDiagramLayout } from "../lib/classifyArrivalSide";
import { formatArrivalTime, formatDestinationLabel } from "../lib/formatArrivalDisplay";
import { pickArrivalsToShow } from "../lib/pickArrivalsToShow";
import type { StationArrivalResult, SubwayArrivalRow } from "../lib/seoulSubway";

function ArrivalRow({ row }: { row: SubwayArrivalRow }) {
  const dest = formatDestinationLabel(row);
  const time = formatArrivalTime(row);
  return (
    <div className="line-board-row">
      <span className="line-board-dest">{dest}</span>
      <span className="line-board-time">{time}</span>
    </div>
  );
}

function ArrivalColumn({ rows }: { rows: SubwayArrivalRow[] }) {
  if (rows.length === 0) {
    return <p className="line-board-empty">—</p>;
  }
  return (
    <div className="line-board-col-inner">
      {rows.map((row, i) => (
        <ArrivalRow
          key={`${row.subwayId}-${row.updnLine}-${row.barvlDt}-${row.arvlMsg2}-${i}`}
          row={row}
        />
      ))}
    </div>
  );
}

function LineBadge({ subwayId }: { subwayId: string }) {
  const color = getSubwayLineColor(subwayId);
  const text = getSubwayLineBadge(subwayId);
  return (
    <span className="line-badge" style={{ color }} aria-hidden="true">
      {text}
    </span>
  );
}

function LineBoard({
  layout,
  arrivals,
  isGrouped,
}: {
  layout: StationDiagramLayout["lines"][number];
  arrivals: SubwayArrivalRow[];
  isGrouped: boolean;
}) {
  const lineArrivals = arrivals.filter((a) => a.subwayId === layout.subwayId);
  const left: SubwayArrivalRow[] = [];
  const right: SubwayArrivalRow[] = [];

  for (const row of lineArrivals) {
    const side = classifyArrivalSide(row, layout);
    if (side === "left") left.push(row);
    else right.push(row);
  }

  const leftShown = pickArrivalsToShow(left);
  const rightShown = pickArrivalsToShow(right);

  const color = getSubwayLineColor(layout.subwayId);
  const sample = lineArrivals[0];
  const lineLabel = getSubwayLineLabel(layout.subwayId, sample?.subwayNm ?? "");

  return (
    <section className={`line-board${isGrouped ? " line-board--grouped" : ""}`}>
      <div className="line-board-header" style={{ backgroundColor: color }}>
        <span className="line-board-nav line-board-nav--prev">
          <span className="line-board-chev" aria-hidden="true">
            ‹
          </span>
          {layout.leftEndpoint}
        </span>

        <span className="line-board-line-label">
          <LineBadge subwayId={layout.subwayId} />
          <span className="line-board-line-name">{lineLabel}</span>
        </span>

        <span className="line-board-nav line-board-nav--next">
          {layout.rightEndpoint !== layout.leftEndpoint ? (
            <>
              {layout.rightEndpoint}
              <span className="line-board-chev" aria-hidden="true">
                ›
              </span>
            </>
          ) : null}
        </span>
      </div>

      <div className="line-board-body">
        <div className="line-board-col">
          <ArrivalColumn rows={leftShown} />
        </div>
        <div className="line-board-divider" aria-hidden="true" />
        <div className="line-board-col">
          <ArrivalColumn rows={rightShown} />
        </div>
      </div>
    </section>
  );
}

type Props = {
  result: StationArrivalResult;
  layout: StationDiagramLayout;
};

export function SubwayStationDiagram({ result, layout }: Props) {
  const isMultiLine = layout.lines.length > 1;

  return (
    <article className={`station-group${isMultiLine ? " station-group--multi" : ""}`}>
      <header className="station-group-header">
        <h3 className="station-group-name">{layout.stationName}</h3>
        {isMultiLine ? (
          <span className="station-group-meta">{layout.lines.length}개 노선</span>
        ) : null}
      </header>

      <div className="station-group-lines">
        {layout.lines.map((line) => (
          <LineBoard
            key={line.subwayId}
            layout={line}
            arrivals={result.arrivals}
            isGrouped
          />
        ))}
      </div>
    </article>
  );
}
