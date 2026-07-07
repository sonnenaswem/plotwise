"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createOrganizationInvitation,
  getCurrentWorkspaceWithMembers,
  getOrganizationInvitations,
  revokeOrganizationInvitation,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationWorkspace,
} from "@/services/organizations/organization-service";

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

function RoleBadge({
  role,
}: {
  role: OrganizationMember["role"];
}) {
  const config =
    role === "owner"
      ? {
          background: "#F2FCE4",
          color: "#639922",
          label: "Owner",
        }
      : role === "admin"
        ? {
            background: "#EEF2FF",
            color: "#6366F1",
            label: "Admin",
          }
        : {
            background: "#F1F5F9",
            color: "#64748B",
            label: "Member",
          };

  return (
    <span
      style={{
        display: "inline-flex",
        width: "fit-content",
        padding: "4px 10px",
        borderRadius: 99,
        background: config.background,
        color: config.color,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {config.label}
    </span>
  );
}

function getInitials(member: OrganizationMember) {
  const initials = [
    member.firstName?.charAt(0),
    member.lastName?.charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (initials) {
    return initials;
  }

  return member.email
    .charAt(0)
    .toUpperCase();
}

export default function SettingsPage() {
  const [workspace, setWorkspace] =
    useState<OrganizationWorkspace | null>(
      null
    );

  const [members, setMembers] = useState<
    OrganizationMember[]
  >([]);

  const [invitations, setInvitations] =
    useState<OrganizationInvitation[]>([]);

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState<"admin" | "member">("member");

  const [inviteOpen, setInviteOpen] =
    useState(false);

  const [inviteSubmitting, setInviteSubmitting] =
    useState(false);

  const [copiedInvitationId, setCopiedInvitationId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setErrorMessage("");

        const result =
          await getCurrentWorkspaceWithMembers();

        if (result.error) {
          throw result.error;
        }

        const currentWorkspace =
          result.data?.workspace ?? null;

        setWorkspace(currentWorkspace);
        setMembers(result.data?.members ?? []);

        if (
          currentWorkspace &&
          (
            currentWorkspace.role === "owner" ||
            currentWorkspace.role === "admin"
          )
        ) {
          const invitationsResult =
            await getOrganizationInvitations(
              currentWorkspace.organizationId
            );

          if (invitationsResult.error) {
            throw invitationsResult.error;
          }

          setInvitations(
            invitationsResult.data
          );
        }
      } catch (error) {
        console.error(
          "Settings loading failed:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Workspace settings could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  async function refreshInvitations() {
    if (!workspace) {
      return;
    }

    const result =
      await getOrganizationInvitations(
        workspace.organizationId
      );

    if (result.error) {
      throw result.error;
    }

    setInvitations(result.data);
  }

  async function handleCreateInvitation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!workspace) {
      return;
    }

    const normalizedInviteEmail =
      inviteEmail.trim().toLowerCase();

    if (!normalizedInviteEmail) {
      setErrorMessage(
        "Please enter the team member's email address."
      );
      return;
    }

    setInviteSubmitting(true);
    setErrorMessage("");

    try {
      const result =
        await createOrganizationInvitation(
          workspace.organizationId,
          normalizedInviteEmail,
          inviteRole
        );

      if (result.error) {
        throw result.error;
      }

      setInviteEmail("");
      setInviteRole("member");
      setInviteOpen(false);

      await refreshInvitations();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The invitation could not be created."
      );
    } finally {
      setInviteSubmitting(false);
    }
  }

  async function handleCopyInvitation(
    invitation: OrganizationInvitation
  ) {
    setErrorMessage("");

    try {
      const invitationUrl =
        `${window.location.origin}/invitations/${invitation.token}`;

      await navigator.clipboard.writeText(
        invitationUrl
      );

      setCopiedInvitationId(invitation.id);

      window.setTimeout(() => {
        setCopiedInvitationId(null);
      }, 2000);
    } catch (error) {
      console.error(
        "Invitation link copy failed:",
        error
      );

      setErrorMessage(
        "The invitation link could not be copied. Please check your browser clipboard permissions."
      );
    }
  }

  async function handleRevokeInvitation(
    invitationId: string
  ) {
    try {
      const result =
        await revokeOrganizationInvitation(
          invitationId
        );

      if (result.error) {
        throw result.error;
      }

      await refreshInvitations();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The invitation could not be revoked."
      );
    }
  }

  if (loading) {
    return (
      <div
        style={{
          ...sans,
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748B",
          fontSize: 14,
        }}
      >
        Loading settings...
      </div>
    );
  }

  const canManageTeam =
    workspace?.role === "owner" ||
    workspace?.role === "admin";

  return (
    <>
      <style>{`
        .settings-page {
          width: 100%;
          max-width: 1000px;
        }

        .settings-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .team-member-row {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            110px
            130px;
          gap: 16px;
          align-items: center;
        }

        .settings-team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .settings-invite-form {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            150px
            auto;
          gap: 10px;
        }

        .settings-invitation-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .settings-invitation-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 760px) {
          .settings-overview-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .settings-invite-form {
            grid-template-columns:
              minmax(0, 1fr)
              130px;
          }

          .settings-invite-submit {
            grid-column: 1 / -1;
            width: 100%;
          }

          .team-member-row {
            grid-template-columns:
              minmax(0, 1fr)
              auto;
            grid-template-areas:
              "member role"
              "member date";
            row-gap: 6px;
          }

          .team-member-details {
            grid-area: member;
          }

          .team-member-role {
            grid-area: role;
            justify-self: end;
          }

          .team-member-date {
            grid-area: date;
            justify-self: end;
          }
        }

        @media (max-width: 560px) {
          .settings-page-title {
            font-size: 28px !important;
          }

          .settings-overview-grid {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .settings-team-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-invite-button {
            width: 100%;
          }

          .settings-invite-form {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .settings-invite-submit {
            grid-column: auto;
          }

          .settings-invitation-row {
            align-items: stretch;
            flex-direction: column;
          }

          .settings-invitation-actions {
            width: 100%;
          }

          .settings-invitation-actions button {
            flex: 1;
          }

          .team-member-row {
            grid-template-columns:
              minmax(0, 1fr);
            grid-template-areas:
              "member"
              "role"
              "date";
            padding: 16px !important;
            gap: 10px;
          }

          .team-member-role,
          .team-member-date {
            justify-self: start;
          }
        }
      `}</style>

      <main
        className="settings-page"
        style={sans}
      >
        <header
          style={{
            marginBottom: 28,
          }}
        >
          <h1
            className="settings-page-title"
            style={{
              ...serif,
              margin: "0 0 4px",
              fontSize: 32,
              fontWeight: 300,
              color: "#0D2137",
              letterSpacing: "-0.5px",
            }}
          >
            Settings
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#94A3B8",
            }}
          >
            Manage your PlotWize account and workspace
          </p>
        </header>

        {errorMessage ? (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: "12px 14px",
              border: "1px solid #FECACA",
              borderRadius: 8,
              background: "#FEF2F2",
              color: "#B91C1C",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        {!workspace ? (
          <section
            style={{
              padding: 24,
              border: "1px solid #E8EDF2",
              borderRadius: 14,
              background: "#FFFFFF",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                fontWeight: 700,
                color: "#639922",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              Personal account
            </p>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 18,
                color: "#0D2137",
              }}
            >
              Your personal workspace
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: 620,
                fontSize: 13,
                lineHeight: 1.7,
                color: "#64748B",
              }}
            >
              Your projects, assessments, and reports
              belong to your personal PlotWize account.
              Team management is available to organization
              workspaces.
            </p>
          </section>
        ) : (
          <>
            <section className="settings-overview-grid">
              {[
                {
                  label: "Organization",
                  value:
                    workspace.organizationName,
                },
                {
                  label: "Your role",
                  value:
                    workspace.role.charAt(0).toUpperCase() +
                    workspace.role.slice(1),
                },
                {
                  label: "Team members",
                  value: members.length.toString(),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "18px 20px",
                    border:
                      "1px solid #E8EDF2",
                    borderRadius: 12,
                    background: "#FFFFFF",
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 11,
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                    }}
                  >
                    {item.label}
                  </p>

                  <p
                    style={{
                      ...serif,
                      margin: 0,
                      fontSize: 21,
                      fontWeight: 600,
                      color: "#0D2137",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </section>

            <section
              style={{
                overflow: "hidden",
                border:
                  "1px solid #E8EDF2",
                borderRadius: 14,
                background: "#FFFFFF",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="settings-team-header"
                style={{
                  padding: "18px 22px",
                  borderBottom:
                    "1px solid #F1F5F9",
                }}
              >
              
                <div>
                  <h2
                    style={{
                      margin: "0 0 3px",
                      fontSize: 15,
                      color: "#0D2137",
                    }}
                  >
                    Team members
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#94A3B8",
                    }}
                  >
                    People with access to{" "}
                    {workspace.organizationName}
                  </p>
                </div>

                {canManageTeam ? (
                  <button
                    type="button"
                    className="settings-invite-button"
                    onClick={() =>
                      setInviteOpen((current) => !current)
                    }
                    style={{
                      padding: "9px 16px",
                      border: "none",
                      borderRadius: 8,
                      background: "#A3E635",
                      color: "#0B1628",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {inviteOpen
                      ? "Cancel"
                      : "+ Invite member"}
                  </button>
                ) : null}
              </div>
              {canManageTeam && inviteOpen ? (
                <form
                  onSubmit={handleCreateInvitation}
                  className="settings-invite-form"
                  style={{
                    padding: "16px 22px",
                    borderBottom: "1px solid #F1F5F9",
                    background: "#FAFBFC",
                  }}
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    required
                    disabled={inviteSubmitting}
                    onChange={(event) =>
                      setInviteEmail(event.target.value)
                    }
                    placeholder="colleague@example.com"
                    style={{
                      width: "100%",
                      minWidth: 0,
                      padding: "10px 12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: 8,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />

                  <select
                    value={inviteRole}
                    disabled={inviteSubmitting}
                    onChange={(event) =>
                      setInviteRole(
                        event.target.value as
                          | "admin"
                          | "member"
                      )
                    }
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: 8,
                      background: "#FFFFFF",
                      fontSize: 13,
                    }}
                  >
                    <option value="member">
                      Member
                    </option>
                    <option value="admin">
                      Admin
                    </option>
                  </select>

                  <button
                    type="submit"
                    className="settings-invite-submit"
                    disabled={inviteSubmitting}
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      borderRadius: 8,
                      background: inviteSubmitting
                        ? "#CBD5E1"
                        : "#0D2137",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: inviteSubmitting
                        ? "not-allowed"
                        : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inviteSubmitting
                      ? "Creating..."
                      : "Create invite"}
                  </button>
                </form>
              ) : null}

              {members.length === 0 ? (
                <div
                  style={{
                    padding: "40px 22px",
                    textAlign: "center",
                    color: "#94A3B8",
                    fontSize: 13,
                  }}
                >
                  No organization members were found.
                </div>
              ) : (
                members.map(
                  (member, index) => (
                    <div
                      key={member.membershipId}
                      className="team-member-row"
                      style={{
                        padding: "15px 22px",
                        borderBottom:
                          index <
                          members.length - 1
                            ? "1px solid #F8FAFC"
                            : "none",
                      }}
                    >
                      <div
                        className="team-member-details"
                        style={{
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 10,
                            background: "#EAF3DE",
                            color: "#639922",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(member)}
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 2px",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0D2137",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {member.displayName}
                          </p>

                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: "#94A3B8",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="team-member-role">
                        <RoleBadge
                          role={member.role}
                        />
                      </div>

                      <span
                        className="team-member-date"
                        style={{
                          fontSize: 12,
                          color: "#94A3B8",
                        }}
                      >
                        {member.joinedAt
                          ? `Joined ${new Date(
                              member.joinedAt
                            ).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}`
                          : "Join date unavailable"}
                      </span>
                    </div>
                  )
                )
              )}

              {canManageTeam && invitations.length > 0 ? (
                <div
                  style={{
                    borderTop: "1px solid #E8EDF2",
                  }}
                >
                  <div
                    style={{
                      padding: "18px 22px 10px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 3px",
                        fontSize: 14,
                        color: "#0D2137",
                      }}
                    >
                      Invitations
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      Pending and previous team invitations
                    </p>
                  </div>

                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="settings-invitation-row"
                      style={{
                        padding: "14px 22px",
                        borderTop: "1px solid #F8FAFC",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: "0 0 3px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0D2137",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {invitation.email}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "#94A3B8",
                            textTransform: "capitalize",
                          }}
                        >
                          {invitation.role} -{" "}
                          {invitation.status}
                        </p>
                      </div>

                      {invitation.status === "pending" ? (
                        <div className="settings-invitation-actions">
                          <button
                            type="button"
                            onClick={() => {
                              void handleCopyInvitation(
                                invitation
                              );
                            }}
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #D1FAE5",
                              borderRadius: 7,
                              background: "#F0FDF4",
                              color: "#639922",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {copiedInvitationId ===
                            invitation.id
                              ? "Copied"
                              : "Copy link"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              void handleRevokeInvitation(
                                invitation.id
                              );
                            }}
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #FECACA",
                              borderRadius: 7,
                              background: "#FEF2F2",
                              color: "#B91C1C",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Revoke
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </>
        )}
      </main>
    </>
  );
}
