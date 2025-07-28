import {
  Page,
  Layout,
  Image,
  Link,
  Text,
  AlphaCard,
  VerticalStack,
  LegacyStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { useEffect, useState } from "react";

export default function HomePage() {

  const [shopName, setShopName] = useState(null);

  useEffect(() => {
    // fetch user information to display on the home page
    // This could be an API call to your backend or a context provider
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        setShopName(data.name);
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const { t } = useTranslation();
  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
        <Layout.Section>
          <AlphaCard sectioned>
            <LegacyStack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
              >
              
                {shopName ? (
                  <LegacyStack.Item fill>
                  <Text variant="headingMd" as="h2">
                    <Trans i18nKey="HomePage.welcomeMessage" values={{ shopName, strong: <strong /> }}></Trans>
                  </Text>
                  </LegacyStack.Item>
                ): "Loading..."}
              
              <LegacyStack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt={t("HomePage.trophyAltText")}
                    width={120}
                  />
                </div>
              </LegacyStack.Item>
            </LegacyStack>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
