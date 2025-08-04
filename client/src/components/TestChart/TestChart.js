import React from 'react';
import { BarChart, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'; import { appendData, fetchData } from '../../utils';
import { useImmer } from 'use-immer';
import produce from "immer";
import { Box, Typography } from '@mui/material';

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

    React.useEffect(() => {
        if (rawData.length === 0) {
            return
        }
        else {
            console.log("RAW DATA: ", rawData)
        }
        setProcessedData((prevVals) => {
            return produce(prevVals, (draft) => {
                draft.length = 0;  // clear existing
                rawData.forEach(run => {
                    draft.push({
                        runId: run.runId,
                        loss: run.data[0].loss
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
    const barCount = processedData.length;
    const fontSize = Math.max(8, Math.min(5, 360 / barCount));
    return (
        <Box sx={{
            position: 'sticky',
            top: '64px', // distance from the top of the viewport
            zIndex: 1,
            backgroundColor: 'white', // helps avoid content bleed
            padding: '10px'
        }}>
            <Typography sx={{ mb: 1, textAlign: "center" }}>
                Test Run Loss
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="runId"
                        type="category"
                        label={{ value: 'Run ID', position: 'insideBottom', offset: -5 }}
                        angle={0}
                        tick={{ fontSize }}
                        fontSize={10}
                        interval={0}
                        textAnchor="middle"
                    />
                    <YAxis
                        label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
                        domain={[0, Math.max(...processedData.map(run => run.loss)) * 1.1]}
                        tickFormatter={(value) => value.toFixed(3)}
                    />
                    <Tooltip />

                    <Bar dataKey="loss" name="Final Loss">
                        {processedData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`hsl(${index * 60}, 65%, 70%)`}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>

    );
}