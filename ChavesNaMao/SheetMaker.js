// Imports
import xlsx from "xlsx";

// Exports
export async function SheetGenerator(objArr) {
    console.log(objArr);
    // Creating new workbook with this
    const workbook = xlsx.utils.book_new();

    // Converting the objArr to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(objArr);

    // Append worksheet to workbook and give the sheet a name
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Resultados');

    // Write and save the sheet file
    xlsx.writeFile(workbook, 'Resultados.xlsx');

    // Returns a nice "COMPLETE" string to be logged ;}
    return "Planilia is ready <=D";
}