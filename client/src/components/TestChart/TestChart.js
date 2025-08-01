import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'; import { appendData, fetchData } from '../../utils';
import { useImmer } from 'use-immer';
import produce from "immer";

function mergeRunsToBarData(runs) {
    const merged = {};
    runs.forEach((run, runIndex) => {
        const runKey = `Run${run.runId}`;
        if (!run || !run.data) return;
        run.data.forEach(entry => {
            const key = entry.step;
            if (!merged[key]) {
                merged[key] = {
                    step: entry.step,
                    stepLabel: entry.stepLabel
                };
            }
            merged[key][runKey] = entry.loss;
        });
    });
    return Object.values(merged);
}

export default function TestChart({ data = null, id = null }) {
    const [rawData, setRawData] = useImmer([])
    const [processedData, setProcessedData] = useImmer([])
    React.useEffect(() => {
        if (data === null) {
            console.log("fetching chart data!!: ", id)
            appendData(`/training_metrics/${id}`, setRawData);
        }
        else {
            console.log("setting rawData to data prop")
            console.log("data: ", data)
            setRawData(data)
        }
    }, [data, id])
    function parseStep(step, datasetSize) {
        const match = step.match(/E(\d+)-B(\d+)/);
        if (!match) return 0;
        const epoch = parseInt(match[1]);
        const batch = parseInt(match[2]);
        return (epoch - 1) * datasetSize + batch;  // or customize as needed
    }
    React.useEffect(() => {
        setProcessedData((prevVals) => {
            return produce(prevVals, (draft) => {
                draft.length = 0;  // clear existing
                rawData.forEach(run => {
                    draft.push({
                        ...run,
                        data: run.data.map((entry, i) => ({
                            ...entry,
                            stepLabel: entry.step,
                            step: parseStep(entry.step, run.datasetSize)
                        }))
                    });
                });
            });
        })
    }, [rawData])

    React.useEffect(() => {
        console.log("processed data: ", processedData)
    }, [processedData])
    React.useEffect(() => {
        console.log("raw data: ", processedData)
    }, [rawData])


    return (
        <ResponsiveContainer width="100%" height={300} >
            <BarChart data={mergeRunsToBarData(processedData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="step" tickFormatter={(value, index) => {
                    const flattened = processedData.flatMap(run => run.data);
                    return flattened[index]?.stepLabel ?? value;
                }} label={{ value: 'Minibatch', position: 'insideBottom', offset: -5 }}
                    domain={processedData ? [Math.min(processedData.flatMap(run => run.data.map(d => d.step))), Math.max(processedData.flatMap(run => run.data.map(d => d.step)))] : null} />
                <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {processedData ? processedData.map((run, i) => (
                    <Bar
                        key={run.runId}
                        dataKey={`Run${run.runId}`}
                        data={run.data}
                        name={`Run ${run.runId}`}
                        fill={`hsl(${i * 60}, 65%, 70%)`} // Different color per run
                    />)) : null}

            </BarChart>
        </ResponsiveContainer>
    );
}