import React, { useCallback } from "react";
import { match, useHistory } from "react-router-dom";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

import { Snackbar } from "@rmwc/snackbar";
import "@rmwc/snackbar/styles";

import * as types from "../types";
import Sidebar from "../Layout/Sidebar";
import { formatError } from "../util/error";
import EntityPageForm from "./EntityPageForm";

type Props = {
  match: match<{ application: string }>;
};

type TData = {
  createEntityPage: types.EntityPage;
};

function NewEntityPage({ match }: Props) {
  const { application } = match.params;

  const [createEntityPage, { error: createError }] = useMutation(
    CREATE_ENTITY_PAGE,
    {
      onCompleted: (data: TData) => {
        history.push(`/${application}/entity-page/${data.createEntityPage.id}`);
      },
    }
  );

  const history = useHistory();

  const handleSubmit = useCallback(
    (data: Omit<types.EntityPage, "blockType" | "versionNumber">) => {
      let { id, ...sanitizedCreateData } = data;

      createEntityPage({
        variables: {
          data: {
            ...sanitizedCreateData,
            app: {
              connect: { id: application },
            },
          },
        },
      }).catch(console.error);
    },
    [createEntityPage, application]
  );

  const errorMessage = formatError(createError);
  return (
    <>
      <main className="entity-page">New Entity Page</main>
      <Sidebar>
        <EntityPageForm
          entityPage={undefined}
          onSubmit={handleSubmit}
          applicationId={application}
        ></EntityPageForm>
      </Sidebar>
      <Snackbar open={Boolean(createError)} message={errorMessage} />
    </>
  );
}

export default NewEntityPage;

const CREATE_ENTITY_PAGE = gql`
  mutation createEntityPage($data: EntityPageCreateInput!) {
    createEntityPage(data: $data) {
      id
      name
      description
      entityId
      pageType
      showAllFields
      showFieldList
      singleRecordSettings {
        allowCreation
        allowDeletion
        allowUpdate
      }
      listSettings {
        enableSearch
        navigateToPageId
      }
    }
  }
`;
