import { gql } from "@apollo/client";

export const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      id
      title
      content
      type
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`;

export const DOCS = gql`
  query Docs {
    documents {
      id
      title
      content
      type
      updatedAt
      createdAt
    }
  }
`;

export const DOC = gql`
  query Doc($id: ID!) {
    document(id: $id) {
      id
      title
      content
      type
      updatedAt
      createdAt
    }
  }
`;

export const CREATE_DOC = gql`
  mutation CreateDoc($input: DocumentInput!) {
    createDocument(input: $input) {
      id
      title
      content
      type
      updatedAt
      createdAt
    }
  }
`;

export const UPDATE_DOC = gql`
  mutation UpdateDoc($id: ID!, $input: DocumentUpdateInput!) {
    updateDocument(id: $id, input: $input) {
      id
      title
      content
      type
      updatedAt
      createdAt
    }
  }
`;

export const DELETE_DOC = gql`
  mutation DeleteDoc($id: ID!) {
    deleteDocument(id: $id)
  }
`;

export const SHARE_DOC = gql`
  mutation ShareDoc($id: ID!, $email: String!) {
    shareDocument(id: $id, email: $email) {
      id
      title
      content
      type
      updatedAt
      createdAt
      owner
      sharedWith
    }
  }
`;

export const LIST_COMMENTS = gql`
  query Comments($documentId: ID!) {
    comments(documentId: $documentId) {
      id
      documentId
      lineNumber
      content
      resolved
      createdAt
      updatedAt
      author {
        id
        username
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      documentId
      lineNumber
      content
      resolved
      createdAt
      updatedAt
      author {
        id
        username
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
