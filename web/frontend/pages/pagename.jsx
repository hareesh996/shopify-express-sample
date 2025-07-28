import { Page, Layout, Text, AlphaCard, VerticalStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";

export default function PageName() {
  const { t } = useTranslation();
  return (
    <Page>
      <TitleBar title={t("PageName.title")}>
        <button variant="primary" onClick={() => console.log("Primary action")}>
          {t("PageName.primaryAction")}
        </button>
        <button onClick={() => console.log("Secondary action")}>
          {t("PageName.secondaryAction")}
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <AlphaCard sectioned>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <VerticalStack>
              <p>{t("PageName.body")}</p>
            </VerticalStack>
          </AlphaCard>
          <AlphaCard sectioned>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <VerticalStack>
              <p>{t("PageName.body")}</p>
            </VerticalStack>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section secondary>
          <AlphaCard sectioned>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <VerticalStack>
              <p>{t("PageName.body")}</p>
            </VerticalStack>
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
