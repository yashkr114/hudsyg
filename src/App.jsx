import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import ForgetPassword from "./auth/ForgetPassword";
import AdminDashboard from "./dashboard/admin-dashboard/AdminDashboard";
import TeamDashboard from "./dashboard/team-dashboard/TeamDashboard";
import ClientDashboard from "./dashboard/client-dashboard/ClientDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import ApplicationManagePage from "./dashboard/admin-dashboard/ApplicationManagePage";
import AccessManagePage from "./dashboard/admin-dashboard/AccessManagePage";
import TeamManagePage from "./dashboard/admin-dashboard/TeamManagePage";
import ClientManagePage from "./dashboard/admin-team-features/ClientManagePage";
import AdminProfilePage from "./dashboard/admin-dashboard/AdminProfilePage";
import AdminUserGuide from "./dashboard/admin-dashboard/AdminUserGuide";
import MyTeam from "./dashboard/team-dashboard/MyTeam";
import TeamProfilePage from "./dashboard/team-dashboard/TeamProfilePage";
import CreateTask from "./dashboard/admin-team-features/CreateTask";
import AssignTask from "./dashboard/admin-team-features/AssignTask";
import TaskManagement from "./dashboard/admin-team-features/TaskManagement";
import MyTasks from "./dashboard/client-dashboard/MyTasks";
import ClientRequests from "./dashboard/admin-team-features/ClientRequests.jsx";
import ChangePassword from "./dashboard/client-dashboard/ChangePassword";
import EmployeeUiManager from "./dashboard/admin-dashboard/EmployeeUiManager";
import ManageRoles from "./dashboard/admin-dashboard/ManageRoles.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgetPassword />} />
       
        {/* Admin Protected Route */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/manage-application" element={<ApplicationManagePage />} />
          <Route path="/admin/manage-access" element={<AccessManagePage />} />
          <Route path="/admin/manage-team" element={<TeamManagePage />} />
          <Route path="/admin/manage-client" element={<ClientManagePage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/user-guide" element={<AdminUserGuide />} />
          <Route path="/admin/create-task" element={<CreateTask />} />
          <Route path="/admin/manage-roles" element={<ManageRoles />} />
          <Route path="/admin/assign-task" element={<AssignTask />} />
          <Route path="/admin/manage-tasks" element={<TaskManagement />} />
          <Route path="/admin/employee-ui" element={<EmployeeUiManager />} />
        </Route>
        {/* Team Protected Route */}
        <Route element={<ProtectedRoute allowedRoles={["team"]} />}>
          <Route path="/team" element={<TeamDashboard />} />
          <Route path="/team/manage-client" element={<ClientManagePage />} />
          {/* <Route path="/dashboard/client" element={<ClientDashboard />} /> */}
          <Route path="/team/myteam" element={<MyTeam />} />
          <Route path="/team/profile" element={<TeamProfilePage />} />
          <Route path="/team/create-task" element={<CreateTask />} />
          <Route path="/team/assign-task" element={<AssignTask />} />
          <Route path="/team/manage-tasks" element={<TaskManagement />} />
          <Route path="/team/client-requests" element={<ClientRequests />} />
        </Route>
        {/* Client Protected Route */}
        <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/client/my-tasks" element={<MyTasks />} />
          <Route path="/client/change-password" element={<ChangePassword />} />
        </Route>
        {/* Fallback: redirect to login if route not found */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
