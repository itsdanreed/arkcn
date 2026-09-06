import { createTreeCollection } from "@/components/ui/tree-select"

export type Node = { value: string; label: string; disabled?: boolean; children?: Node[] }

export const folders = createTreeCollection<Node>({
  rootNode: {
    value: "root",
    label: "Root",
    children: [
      {
        value: "projects",
        label: "Projects",
        children: [
          {
            value: "projects/toolkit",
            label: "UI Toolkit",
            children: [
              { value: "projects/toolkit/design", label: "Design" },
              { value: "projects/toolkit/specs", label: "Specs" },
            ],
          },
          { value: "projects/website", label: "Website" },
          { value: "projects/mobile", label: "Mobile app" },
        ],
      },
      {
        value: "shared",
        label: "Shared",
        children: [
          { value: "shared/brand", label: "Brand assets" },
          { value: "shared/templates", label: "Templates" },
          { value: "shared/legal", label: "Legal", disabled: true },
        ],
      },
      { value: "archive", label: "Archive" },
    ],
  },
})

export const org = createTreeCollection<Node>({
  rootNode: {
    value: "root",
    label: "Company",
    children: [
      {
        value: "eng",
        label: "Engineering",
        children: [
          {
            value: "eng-platform",
            label: "Platform",
            children: [
              { value: "u-ava", label: "Ava Chen" },
              { value: "u-noah", label: "Noah Patel" },
              { value: "u-mia", label: "Mia Torres" },
            ],
          },
          {
            value: "eng-web",
            label: "Web",
            children: [
              { value: "u-liam", label: "Liam Brooks" },
              { value: "u-zoe", label: "Zoe Kim" },
            ],
          },
        ],
      },
      {
        value: "design",
        label: "Design",
        children: [
          { value: "u-ella", label: "Ella Novak" },
          { value: "u-omar", label: "Omar Haddad" },
        ],
      },
      {
        value: "sales",
        label: "Sales",
        children: [
          { value: "u-jack", label: "Jack Rivera" },
          { value: "u-ivy", label: "Ivy Laurent" },
          { value: "u-sam", label: "Sam Okafor" },
        ],
      },
    ],
  },
})

export const locations = createTreeCollection<Node>({
  rootNode: {
    value: "root",
    label: "World",
    children: [
      {
        value: "us",
        label: "United States",
        children: [
          {
            value: "us-ca",
            label: "California",
            children: [
              { value: "us-ca-sf", label: "San Francisco" },
              { value: "us-ca-la", label: "Los Angeles" },
              { value: "us-ca-sd", label: "San Diego" },
            ],
          },
          {
            value: "us-ny",
            label: "New York",
            children: [
              { value: "us-ny-nyc", label: "New York City" },
              { value: "us-ny-buf", label: "Buffalo" },
            ],
          },
          {
            value: "us-tx",
            label: "Texas",
            children: [
              { value: "us-tx-aus", label: "Austin" },
              { value: "us-tx-hou", label: "Houston" },
            ],
          },
        ],
      },
      {
        value: "ca",
        label: "Canada",
        children: [
          {
            value: "ca-on",
            label: "Ontario",
            children: [
              { value: "ca-on-tor", label: "Toronto" },
              { value: "ca-on-ott", label: "Ottawa" },
            ],
          },
          {
            value: "ca-bc",
            label: "British Columbia",
            children: [{ value: "ca-bc-van", label: "Vancouver" }],
          },
        ],
      },
      {
        value: "uk",
        label: "United Kingdom",
        children: [
          {
            value: "uk-eng",
            label: "England",
            children: [
              { value: "uk-eng-lon", label: "London" },
              { value: "uk-eng-man", label: "Manchester" },
            ],
          },
          { value: "uk-sco", label: "Scotland", children: [{ value: "uk-sco-edi", label: "Edinburgh" }] },
        ],
      },
    ],
  },
})

export const categories = createTreeCollection<Node>({
  rootNode: {
    value: "root",
    label: "Catalog",
    children: [
      {
        value: "electronics",
        label: "Electronics",
        children: [
          {
            value: "electronics/audio",
            label: "Audio",
            children: [
              { value: "electronics/audio/headphones", label: "Headphones" },
              { value: "electronics/audio/speakers", label: "Speakers" },
            ],
          },
          {
            value: "electronics/computers",
            label: "Computers",
            children: [
              { value: "electronics/computers/laptops", label: "Laptops" },
              { value: "electronics/computers/desktops", label: "Desktops" },
              { value: "electronics/computers/accessories", label: "Accessories" },
            ],
          },
        ],
      },
      {
        value: "home",
        label: "Home",
        children: [
          { value: "home/kitchen", label: "Kitchen" },
          { value: "home/furniture", label: "Furniture" },
          { value: "home/lighting", label: "Lighting" },
        ],
      },
      {
        value: "outdoors",
        label: "Outdoors",
        children: [
          { value: "outdoors/camping", label: "Camping" },
          { value: "outdoors/cycling", label: "Cycling" },
        ],
      },
    ],
  },
})

export type Permission = { value: string; label: string; group?: string; disabled?: boolean }

export const permissions: Permission[] = [
  { value: "read", label: "View records", group: "Records", disabled: true },
  { value: "comment", label: "Comment on records", group: "Records" },
  { value: "edit", label: "Edit records", group: "Records" },
  { value: "delete", label: "Delete records", group: "Records" },
  { value: "export", label: "Export data", group: "Data" },
  { value: "import", label: "Import data", group: "Data" },
  { value: "api", label: "Use the API", group: "Data" },
  { value: "billing", label: "Manage billing", group: "Admin" },
  { value: "members", label: "Invite members", group: "Admin" },
  { value: "roles", label: "Manage roles", group: "Admin" },
  { value: "audit", label: "View audit log", group: "Admin" },
  { value: "sso", label: "Configure SSO", group: "Admin" },
]
