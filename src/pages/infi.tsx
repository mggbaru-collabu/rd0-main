import { useEffect, useState } from "react";
import { Input, Group, CloseButton, ActionIcon, Button } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons";
import produce from "immer";

function Infi() {
  const [fetchCounter, setFetchCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);

  useEffect(() => {
    async function execute() {
      setLoading(true);
      const response = await fetch("/api/infi/accounts");
      const data = await response.json();
      setAccounts(data.value);
      setLoading(false);
    }
    execute();
  }, [fetchCounter]);

  return (
    <div>
      <h1>Infiprover Setting</h1>
      {loading ? (
        <span>Loading...</span>
      ) : (
        <>
          <div style={{ width: 400 }}>
            {accounts.map((account, index) => {
              return (
                <Group key={index}>
                  <Input
                    value={account}
                    style={{ flexGrow: 1 }}
                    onChange={(event: any) => {
                      setAccounts(
                        produce((draft: string[]) => {
                          draft[index] = event.target.value;
                          return draft;
                        })
                      );
                    }}
                  />
                  <CloseButton
                    size="xl"
                    color="red"
                    onClick={() => {
                      setAccounts((oldAccounts) =>
                        oldAccounts.filter((_, i) => index !== i)
                      );
                    }}
                  />
                </Group>
              );
            })}
            <Group>
              <Input
                value={draft}
                style={{ flexGrow: 1 }}
                placeholder={"account baru"}
                onChange={(e: any) => setDraft(e.target.value)}
              />
              <ActionIcon
                size="lg"
                ml="xs"
                onClick={() => {
                  setAccounts((oldAccounts) => oldAccounts.concat(draft));
                  setDraft("");
                }}
              >
                <IconUserPlus color="blue" />
              </ActionIcon>
            </Group>
            <Group>
              <Button
                mt="sm"
                fullWidth
                onClick={async () => {
                  await fetch("/api/infi/accounts", {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ accounts }),
                  });
                  setFetchCounter((_old) => _old + 1);
                }}
              >
                Save
              </Button>
            </Group>
          </div>
        </>
      )}
    </div>
  );
}

export default Infi;
