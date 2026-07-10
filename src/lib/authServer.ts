import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  AccountStatus,
  DataScope,
  ModuleCode,
  PermissionAction,
  RoleCode,
} from "@prisma/client";

import { prisma } from "./prisma";
import { SESSION_COOKIE, parseSessionCookie } from "./security";
import { ADMIN_ROLE_CODES, isModuleInRoleProfile } from "./rbac";

type RolePermissionWithPermission = {
  permission: {
    module: ModuleCode;
    action: PermissionAction;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;

  organizationId: string;
  organizationCode: string;

  departmentId: string | null;
  departmentCode: string | null;

  customerId: string | null;

  roleId: string;
  roleCode: RoleCode;
  roleName: string;

  dataScope: DataScope;

  mustChangePassword: boolean;

  sessionId: string;

  permissions: {
    module: ModuleCode;
    action: PermissionAction;
  }[];
};


export async function getCurrentSession() {
  const cookieStore = await cookies();

  const parsed = parseSessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value
  );

  if (!parsed) return null;


  const session = await prisma.session.findUnique({
    where: {
      id: parsed.sessionId,
    },

    include: {
      user: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },

          department: true,
          customer: true,
          organization: true,
        },
      },
    },
  });


  if (
    !session ||
    session.tokenHash !== parsed.tokenHash ||
    session.revokedAt ||
    session.expiresAt < new Date()
  ) {
    return null;
  }


  if (
    !session.user ||
    session.user.status !== AccountStatus.ACTIVE
  ) {
    return null;
  }


  await prisma.session.update({
    where: {
      id: session.id,
    },

    data: {
      lastSeenAt: new Date(),
    },
  }).catch(() => null);


  return session;
}



export async function getCurrentUser(): Promise<AuthUser | null> {

  const session = await getCurrentSession();

  if (!session) return null;


  const user = session.user;


  return {

    id: user.id,

    email: user.email,

    name: user.name,


    organizationId: user.organizationId,

    organizationCode:
      user.organization.code,


    departmentId:
      user.departmentId,


    departmentCode:
      user.department?.code ?? null,


    customerId:
      user.customerId,


    roleId:
      user.roleId,


    roleCode:
      user.role.code,


    roleName:
      user.role.name,


    dataScope:
      user.role.dataScope,


    mustChangePassword:
      user.mustChangePassword,


    sessionId:
      session.id,



    permissions:
      user.role.rolePermissions.map(
        (
          item: RolePermissionWithPermission
        ) => ({

          module:
            item.permission.module as ModuleCode,


          action:
            item.permission.action as PermissionAction,

        })
      ),

  };
}




export function userHasPermission(
  user: AuthUser,
  module: ModuleCode,
  action: PermissionAction
) {


  if (
    ADMIN_ROLE_CODES.has(user.roleCode)
  ) {
    return true;
  }


  if (
    !isModuleInRoleProfile(
      user,
      module
    )
  ) {
    return false;
  }



  return user.permissions.some(
    (item) =>
      item.module === module &&
      (
        item.action === action ||
        item.action === PermissionAction.MANAGE
      )
  );
}





export async function authorize(
  module: ModuleCode,
  action: PermissionAction = PermissionAction.VIEW
) {


  const user =
    await getCurrentUser();



  if (!user) {

    return {
      response:
        NextResponse.json(
          {
            ok:false,
            message:
              "Chưa đăng nhập hoặc phiên đã hết hạn.",
          },
          {
            status:401,
          }
        ),
    } as const;

  }



  if (
    !userHasPermission(
      user,
      module,
      action
    )
  ) {


    return {

      response:
        NextResponse.json(
          {
            ok:false,
            message:
              "Không có quyền thực hiện chức năng này.",
          },
          {
            status:403,
          }
        ),

    } as const;

  }



  return {
    user,
  } as const;

}





export function publicUser(
  user: AuthUser
) {

  return {

    id:user.id,

    email:user.email,

    name:user.name,


    role:user.roleName,

    roleCode:user.roleCode,


    scope:user.dataScope,


    departmentId:user.departmentId,


    customerId:user.customerId,


    mustChangePassword:
      user.mustChangePassword,


    sessionId:
      user.sessionId,


    permissions:
      user.permissions,


    signedAt:
      new Date().toISOString(),

  };

}





export async function audit(

  user: AuthUser,

  module: ModuleCode,

  action: PermissionAction,

  message:string,

  entity?:string,

  entityId?:string,

  metadata?:Record<string,unknown>

) {


  const headerStore =
    await headers();



  await prisma.auditLog.create({

    data:{


      organizationId:
        user.organizationId,


      userId:
        user.id,


      module,


      action,


      message,


      entity,


      entityId,


      userAgent:
        headerStore.get(
          "user-agent"
        ),


      ip:
        headerStore
          .get("x-forwarded-for")
          ?.split(",")[0]
          ?.trim(),


      metadata,


    },

  }).catch(()=>null);


}
