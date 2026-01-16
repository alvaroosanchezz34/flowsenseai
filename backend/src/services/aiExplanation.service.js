export const generatePredictionExplanation = ({
    stepName,
    todayAvg,
    predictedTomorrow,
    trend
}) => {
    if (trend === "up") {
        return `
El paso "${stepName}" muestra una tendencia negativa.
Actualmente tarda unos ${todayAvg} segundos de media.
Si el comportamiento continúa, mañana podría alcanzar aproximadamente ${predictedTomorrow} segundos,
lo que puede generar retrasos adicionales en el proceso.
`;
    }

    return `
El paso "${stepName}" no presenta una tendencia preocupante en este momento.
`;
};
