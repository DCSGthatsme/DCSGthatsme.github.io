import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.Breadcrumbs(),],
  //footer: Component.Footer({links: {GitHub: "https://github.com/jackyzha0/quartz", "Discord Community": "https://discord.gg/cRFFHYye7t",},}),
  footer: Component.Footer(),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    //Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
    Component.MobileOnly(Component.Search()),
  ],
  right: [
    //Component.Graph(),
    Component.DesktopOnly(Component.Search()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.MobileOnly(Component.Explorer()),
    Component.DesktopOnly(Component.Backlinks()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
