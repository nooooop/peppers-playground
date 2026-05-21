"use client";

import { getSubwayLineColor, getSubwayLineLabel } from "../data/subwayLineColors";
import { classifyArrivalSide, type StationDiagramLayout } from "../lib/classifyArrivalSide";
import type { StationArrivalResult, SubwayArrivalRow } from "../lib/seoulSubway";

function ArrivalBubble({ row }: { row: SubwayArrivalRow }) {
  return (
    <div className="diagram-arrival">
      <span className="diagram-arrival-msg">{row.arvlMsg2 || row.arvlMsg3}</span>
      <span className="diagram-arrival-sub">{row.trainLineNm}</span>
    </div>
  );
}

function LineRow({
  layout,
  arrivals,
}: {
  layout: StationDiagramLayout["lines"][number];
  arrivals: SubwayArrivalRow[];
}) {
  const lineArrivals = arrivals.filter((a) => a.subwayId === layout.subwayId);
  const left: SubwayArrivalRow[] = [];
  const right: SubwayArrivalRow[] = [];

  for (const row of lineArrivals) {
    const side = classifyArrivalSide(row, layout);
    if (side === "left") left.push(row);
    else right.push(row);
  }

  const color = getSubwayLineColor(layout.subwayId);
  const lineLabel = getSubwayLineLabel(
    layout.subwayId,
    lineArrivals[0]?.subwayNm ?? ""
  );

  return (
    <div className="diagram-line-block">
      <div className="diagram-line-label" style={{ color }}>
        {lineLabel}
      </div>
      <div className="diagram-line-row">
        <div className="diagram-wing diagram-wing--left">
          <div className="diagram-endpoint">
            <span className="diagram-arrow" aria-hidden="true">
              ←
            </span>
            <span>{layout.leftEndpoint}</span>
          </div>
          <div className="diagram-arrivals">
            {left.map((row, i) => (
              <ArrivalBubble key={`l-${row.subwayId}-${row.updnLine}-${row.arvlMsg2}-${i}`} row={row} />
            ))}
          </div>
        </div>

        <div className="diagram-track" aria-hidden="true">
          <div className="diagram-track-bar" style={{ backgroundColor: color }} />
        </div>

        <div className="diagram-wing diagram-wing--right">
          <div className="diagram-endpoint diagram-endpoint--right">
            <span>{layout.rightEndpoint}</span>
            <span className="diagram-arrow" aria-hidden="true">
              →
            </span>
          </div>
          <div className="diagram-arrivals">
            {right.map((row, i) => (
              <ArrivalBubble key={`r-${row.subwayId}-${row.updnLine}-${row.arvlMsg2}-${i}`} row={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  result: StationArrivalResult;
  layout: StationDiagramLayout;
};

export function SubwayStationDiagram({ result, layout }: Props) {
  return (
    <article className="station-diagram">
      <h3 className="station-diagram-name">{layout.stationName}</h3>
      {layout.lines.map((line) => (
        <LineRow key={line.subwayId} layout={line} arrivals={result.arrivals} />
      ))}
    </article>
  );
}
