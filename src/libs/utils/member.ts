import Errors, { HttpCode, Message } from "../Errors";
import { MemberStatus, MemberType } from "../enums/memberTypeEnum";
import MemberInput, { LoginInput, Member } from "../types/member";

export function isRecord(input: unknown): input is Record<string, unknown> {
    return typeof input === "object" && input !== null && !Array.isArray(input);
}

export function invalidInput(): Errors {
    return new Errors(HttpCode.BAD_REQUEST, Message.INVALID_INPUT);
}

export function validateLoginInput(input: unknown): LoginInput {
    if (!isRecord(input) ||
        typeof input.memberNick !== "string" || !input.memberNick.trim() ||
        typeof input.memberPassword !== "string" || !input.memberPassword.trim()) {
        throw invalidInput();
    }
    return { memberNick: input.memberNick, memberPassword: input.memberPassword };
}

export function buildMemberInput(input: unknown, memberType: MemberType): MemberInput {
    const credentials = validateLoginInput(input);
    if (!isRecord(input) || typeof input.memberPhone !== "string" || !input.memberPhone.trim()) {
        throw invalidInput();
    }
    const result: MemberInput = {
        ...credentials,
        memberPhone: input.memberPhone,
        memberType,
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: 0,
    };
    for (const field of ["memberAddress", "memberDesc", "memberImage"] as const) {
        if (input[field] !== undefined) {
            if (typeof input[field] !== "string") throw invalidInput();
            result[field] = input[field];
        }
    }
    return result;
}

export function isMemberId(input: unknown): input is string {
    return typeof input === "string" && /^[a-f\d]{24}$/i.test(input);
}

export function sanitizeMember(member: Member): Omit<Member, "memberPassword"> {
    const { memberPassword, ...safeMember } = member;
    return safeMember;
}

// Exceptions and request/member objects may contain credentials.
export function logMemberError(operation: string, error: unknown): void {
    console.error(operation, error instanceof Errors ? error.code : HttpCode.INTERNAL_SERVER_ERROR);
}
