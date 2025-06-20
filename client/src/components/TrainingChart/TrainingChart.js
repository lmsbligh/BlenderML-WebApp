import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrainingChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300} >
            <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" label={{ value: 'Minibatch', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {data.map((run, i) => (
                    <Line
                        key={run.run_id}
                        type="monotone"
                        dataKey="loss"
                        data={run.data}
                        name={`Run ${run.run_id}`}
                        stroke={`hsl(${i * 60}, 65%, 70%)`} // Different color per run
                    />
                ))}

            </LineChart>
        </ResponsiveContainer>
    );
}