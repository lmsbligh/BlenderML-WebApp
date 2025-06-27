import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { appendData, fetchData } from '../../utils';

export default function TrainingChart({ data = null, id = null }) {
    const [dataState, setDataState] = React.useState([])

    React.useEffect(() => {
        if (data === null) {
            console.log("fetching chart data!!: ", id)
            appendData(`/training_metrics/${id}`, setDataState);
        }
        else {
            setDataState(data)
        }
    }, [data, id])

    React.useEffect(() => {
        console.log("dataState: ", dataState)
    }, [dataState])

    return (
        <ResponsiveContainer width="100%" height={300} >
            <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" label={{ value: 'Minibatch', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {dataState ? dataState.map((run, i) => (
                    <Line
                        key={run.run_id}
                        type="monotone"
                        dataKey="loss"
                        data={run.data}
                        name={`Run ${run.run_id}`}
                        stroke={`hsl(${i * 60}, 65%, 70%)`} // Different color per run
                    />)) : null}

            </LineChart>
        </ResponsiveContainer>
    );
}