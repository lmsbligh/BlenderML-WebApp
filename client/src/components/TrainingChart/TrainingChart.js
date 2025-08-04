import React from 'react';
import { LineChart, Line, Brush, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { appendData, fetchData } from '../../utils';
import { useImmer } from 'use-immer';
import produce from "immer";
import { Box, Typography } from '@mui/material';

export default function TrainingChart({ data = null, id = null }) {
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
        console.log("rawData: ", rawData)
        if (rawData.length > 0) {
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
        }

    }, [rawData])

    React.useEffect(() => {
        console.log("processed data: ", processedData)
    }, [processedData])
    React.useEffect(() => {
        console.log("raw data: ", processedData)
    }, [rawData])


    return (
        <Box sx={{
            position: 'sticky',
            top: '64px', // distance from the top of the viewport
            zIndex: 1,
            backgroundColor: 'white', // helps avoid content bleed
            padding: '10px'
        }}>
            <Typography sx={{ mb: 1, textAlign: "center" }}>
                Training Session Running Loss
            </Typography>

            <ResponsiveContainer width="100%" height={300} >
                <LineChart data={processedData.flatMap(run => run.data)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="step" tickFormatter={(value, index) => {
                        const flattened = processedData.flatMap(run => run.data);
                        return flattened[index]?.stepLabel ?? value;
                    }} label={{ value: 'Minibatch', position: 'insideBottom', offset: -5 }}
                        domain={processedData ? [Math.min(processedData.flatMap(run => run.data.map(d => d.step))), Math.max(processedData.flatMap(run => run.data.map(d => d.step)))] : null} />
                    <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    {processedData.length > 1 ? <Legend /> : null}
                    {processedData ? processedData.map((run, i) => (
                        <Line
                            key={run.runId}
                            type="monotone"
                            dataKey="loss"
                            data={run.data}
                            name={`Run ${run.runId}`}
                            stroke={`hsl(${i * 60}, 65%, 70%)`} // Different color per run
                        />)) : null}

                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}