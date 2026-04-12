import { apollo } from "./graphql/client";
import { auth } from "./auth";
import {
  ME, LOGIN, REGISTER,
  DOCS, DOC, CREATE_DOC, UPDATE_DOC, DELETE_DOC,
  LIST_COMMENTS, ADD_COMMENT, SHARE_DOC, EXECUTE_CODE
} from "./graphql/operations";

const toId = (x) => x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;

export const api = {
  async register(p) {
    const { data } = await apollo.mutate({
      mutation: REGISTER,
      variables: { input: p },
    });
    return data.register;
  },

  async login(p) {
    const { data } = await apollo.mutate({
      mutation: LOGIN,
      variables: { input: p },
    });
    return data.login;
  },

  async me() {
    const { data } = await apollo.query({ query: ME, fetchPolicy: "network-only" });
    return data.me;
  },

  async listDocs() {
    try {
      const { data } = await apollo.query({ query: DOCS, fetchPolicy: "network-only" });
      return (data.documents || []).map(d => ({ ...d, id: String(toId(d)) }));
    } catch (e) {
      if (e.graphQLErrors?.some(err => err.extensions?.code === 'UNAUTHENTICATED') || e.networkError?.statusCode === 401) {
        auth.clear();
        window.location.href = "/login";
      }
      throw e;
    }
  },

  async getDoc(id) {
    const { data } = await apollo.query({
      query: DOC,
      variables: { id },
      fetchPolicy: "network-only"
    });
    const d = data.document;
    const normId = String(toId(d) ?? id);
    return { ...d, id: normId };
  },

  async createDoc(payload) {
    const { data } = await apollo.mutate({
      mutation: CREATE_DOC,
      variables: { input: payload }
    });
    const d = data.createDocument;
    const normId = String(toId(d));
    return { ...d, id: normId };
  },

  async updateDoc(id, payload) {
    await apollo.mutate({
      mutation: UPDATE_DOC,
      variables: { id, input: payload }
    });
    return null;
  },

  async deleteDoc(id) {
    await apollo.mutate({
      mutation: DELETE_DOC,
      variables: { id }
    });
    return null;
  },

  async listComments(documentId) {
    const { data } = await apollo.query({
      query: LIST_COMMENTS,
      variables: { documentId },
      fetchPolicy: "network-only"
    });
    return data.comments || [];
  },

  async addComment(payload) {
    const { data } = await apollo.mutate({
      mutation: ADD_COMMENT,
      variables: { input: payload }
    });
    return data.createComment;
  },

  async shareDoc(id, email) {
    const { data } = await apollo.mutate({
      mutation: SHARE_DOC,
      variables: { id, email }
    });
    return data.shareDocument;
  },

  async executeCode(codeBase64) {
    const { data } = await apollo.mutate({
      mutation: EXECUTE_CODE,
      variables: { codeBase64 }
    });
    return data.executeCode;
  }
};