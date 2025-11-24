import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataDevices } from "../../Data/device.js";
import Header from "../../global/Header";

const colunas: GridColDef[] = [
  { field: "id", headerName: "End Device" },
  {
    field: "adr",
    headerName: "Address",
    flex: 1,
    cellClassName: "name-cell",
  },
  {
    field: "param",
    headerName: "Variáveis",
    flex: 1,
    cellClassName: "name-cell",
  },
  {
    field: "value",
    headerName: "Valor",
    headerAlign: "left",
    align: "left",
  },
];

export default function Devices() {
  return (
    <Box m="20px">
      <Header title="DEVICES" subtitle="Lista de Dispositivos disponíveis" />
      <Box
        m="40px 0 0 0"
        height="75vh"
      >
        <DataGrid rows={DataDevices} columns={colunas} />
      </Box>
    </Box>
  );
}
