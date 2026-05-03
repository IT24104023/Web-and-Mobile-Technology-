const roles = ["patient", "doctor"];

function RoleTabs({ selectedRole, onChange }) {
  return (
    <div className="role-tabs">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          className={selectedRole === role ? "active" : ""}
          onClick={() => onChange(role)}
        >
          {role}
        </button>
      ))}
    </div>
  );
}

export default RoleTabs;
