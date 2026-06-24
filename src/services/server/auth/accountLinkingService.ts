import {
  createCompanyServer,
  deleteCompanyByIdServer,
  getCompanyByEmailServer,
  getCompanyByRucServer,
} from "@/services/server/repositories/companyRepository";
import {
  countProfilesByCompanyIdServer,
  createProfileServer,
  deleteProfileByUserIdServer,
  getProfileByUserIdServer,
} from "@/services/server/repositories/profileRepository";
import { updateAuthUserMetadataServer } from "@/services/server/repositories/authUserAdminRepository";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeRuc(ruc: string) {
  return ruc.trim();
}

export async function provisionCompanyAndProfileForUser(input: {
  userId: string;
  fullName: string;
  companyName: string;
  email: string;
  ruc: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedRuc = normalizeRuc(input.ruc);
  const fullName = input.fullName.trim();
  const companyName = input.companyName.trim();

  const existingProfileResult = await getProfileByUserIdServer(input.userId);
  if (existingProfileResult.error) {
    return { data: null, error: existingProfileResult.error };
  }

  if (existingProfileResult.data) {
    return { data: existingProfileResult.data, error: null };
  }

  const existingCompanyByRucResult = await getCompanyByRucServer(normalizedRuc);
  if (existingCompanyByRucResult.error) {
    return { data: null, error: existingCompanyByRucResult.error };
  }

  if (existingCompanyByRucResult.data) {
    return {
      data: null,
      error: new Error(
        "Este RUC ya se encuentra registrado. Solicita acceso a un administrador."
      ),
    };
  }

  const existingCompanyByEmailResult =
    await getCompanyByEmailServer(normalizedEmail);
  if (existingCompanyByEmailResult.error) {
    return { data: null, error: existingCompanyByEmailResult.error };
  }

  if (existingCompanyByEmailResult.data) {
    return {
      data: null,
      error: new Error(
        "Este correo ya está asociado a una empresa registrada."
      ),
    };
  }

  const companyResult = await createCompanyServer({
    ruc: normalizedRuc,
    business_name: companyName,
    email: normalizedEmail,
  });

  if (companyResult.error || !companyResult.data) {
    return {
      data: null,
      error:
        companyResult.error ||
        new Error("No se pudo crear la empresa para esta cuenta"),
    };
  }

  const profileResult = await createProfileServer({
    user_id: input.userId,
    company_id: companyResult.data.id,
    full_name: fullName,
    role: "admin",
  });

  if (profileResult.error || !profileResult.data) {
    const cleanupCompanyResult = await deleteCompanyByIdServer(
      companyResult.data.id
    );
    if (cleanupCompanyResult.error) {
      console.error(
        "Failed to cleanup company after profile creation error",
        cleanupCompanyResult.error
      );
    }

    return {
      data: null,
      error: profileResult.error || new Error("No se pudo crear el perfil"),
    };
  }

  const metadataResult = await updateAuthUserMetadataServer(input.userId, {
    full_name: fullName,
    company_id: companyResult.data.id,
    company_ruc: companyResult.data.ruc,
  });

  if (metadataResult.error) {
    const cleanupProfileResult = await deleteProfileByUserIdServer(
      input.userId
    );
    if (cleanupProfileResult.error) {
      console.error(
        "Failed to cleanup profile after metadata error",
        cleanupProfileResult.error
      );
    }

    const cleanupCompanyResult = await deleteCompanyByIdServer(
      companyResult.data.id
    );
    if (cleanupCompanyResult.error) {
      console.error(
        "Failed to cleanup company after metadata error",
        cleanupCompanyResult.error
      );
    }

    return { data: profileResult.data, error: metadataResult.error };
  }

  return { data: profileResult.data, error: null };
}

export async function getAuthorizedProfileForUser(userId: string) {
  const profileResult = await getProfileByUserIdServer(userId);

  if (profileResult.error) {
    return { data: null, error: profileResult.error };
  }

  if (!profileResult.data) {
    return {
      data: null,
      error: new Error(
        "Tu cuenta no tiene un perfil autorizado para acceder al dashboard."
      ),
    };
  }

  return { data: profileResult.data, error: null };
}

export async function canManageCompanySettings(userId: string) {
  const profileResult = await getAuthorizedProfileForUser(userId);

  if (profileResult.error || !profileResult.data) {
    return { allowed: false, error: profileResult.error, data: null };
  }

  if (profileResult.data.role === "admin") {
    return { allowed: true, error: null, data: profileResult.data };
  }

  const countResult = await countProfilesByCompanyIdServer(
    profileResult.data.company_id
  );

  if (countResult.error) {
    return { allowed: false, error: countResult.error, data: null };
  }

  const isSingleProfileCompany = countResult.count <= 1;

  return {
    allowed: isSingleProfileCompany,
    error: isSingleProfileCompany
      ? null
      : new Error(
          "Solo los administradores pueden modificar las credenciales de SUNAT."
        ),
    data: profileResult.data,
  };
}
