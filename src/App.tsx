import ReactSVG from "@/assets/react.svg";
import { FullScreenServerAdminDashboardComponent } from "@/components/full-screen-server-admin-dashboard";
import { DataLakeFlowManagerComponent } from "@/components/data-lake-flow-manager";
import UserPermissions from "@/components/user-permissions";
import { DataLakeExplorerComponent } from "@/components/data-lake-explorer";
import { DataLakeCuadernos } from "@/components/data-lake-cuadernos";
function App() {
  return (
    <div>
      <div>
        <FullScreenServerAdminDashboardComponent></FullScreenServerAdminDashboardComponent>
      </div>
      <div>
        <DataLakeFlowManagerComponent></DataLakeFlowManagerComponent>
      </div>
      <div>
        <UserPermissions></UserPermissions>
      </div>
      <div>
        <DataLakeExplorerComponent></DataLakeExplorerComponent>
      </div>
      <div>
        <DataLakeCuadernos></DataLakeCuadernos>
      </div>
    </div>
  );
}

export default App;
