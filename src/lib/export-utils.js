
export function exportFitnessToCSV(fitnessData) {
    if (!fitnessData) return;

    // Musculation Export
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Date,Nom,Exercice,Reps,Poids,VolumeTotal\n";

    const workouts = fitnessData.musculationSessions || [];
    workouts.forEach(s => {
        const date = new Date(s.date).toLocaleDateString();
        s.exercises.forEach(ex => {
            csvContent += `Musculation,${date},${s.name},"${ex.name}",${ex.reps},${ex.weight},${s.totalVolume}\n`;
        });
    });

    // Cardio Export
    const cardios = fitnessData.cardioSessions || [];
    cardios.forEach(s => {
        const date = new Date(s.date).toLocaleDateString();
        csvContent += `Cardio,${date},${s.type},,,${s.duration}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studio_fitness_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
