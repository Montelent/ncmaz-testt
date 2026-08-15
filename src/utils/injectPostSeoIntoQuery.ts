import {
	Kind,
	visit,
	type DocumentNode,
	type FieldNode,
	type SelectionNode,
} from 'graphql'

/** Rank Math seo selection — no codegen required */
function seoSelection(): FieldNode {
	return {
		kind: Kind.FIELD,
		name: { kind: Kind.NAME, value: 'seo' },
		selectionSet: {
			kind: Kind.SELECTION_SET,
			selections: [
				field('title'),
				field('description'),
				field('canonicalUrl'),
				field('robots'),
				{
					kind: Kind.FIELD,
					name: { kind: Kind.NAME, value: 'jsonLd' },
					selectionSet: {
						kind: Kind.SELECTION_SET,
						selections: [field('raw')],
					},
				},
				{
					kind: Kind.FIELD,
					name: { kind: Kind.NAME, value: 'openGraph' },
					selectionSet: {
						kind: Kind.SELECTION_SET,
						selections: [
							field('title'),
							field('description'),
							field('url'),
							field('type'),
							field('siteName'),
							{
								kind: Kind.FIELD,
								name: { kind: Kind.NAME, value: 'twitterMeta' },
								selectionSet: {
									kind: Kind.SELECTION_SET,
									selections: [field('card')],
								},
							},
						],
					},
				},
			],
		},
	}
}

function field(name: string): FieldNode {
	return {
		kind: Kind.FIELD,
		name: { kind: Kind.NAME, value: name },
	}
}

function hasSeoField(selections: readonly SelectionNode[]): boolean {
	return selections.some(
		(s) => s.kind === Kind.FIELD && s.name.value === 'seo',
	)
}

/**
 * Clone GetPostSiglePageDocument and add post { seo { ... } }
 * so Faust/Apollo request Rank Math without regenerating __generated__.
 */
export function injectPostSeoIntoQuery(document: DocumentNode): DocumentNode {
	return visit(document, {
		Field(node) {
			if (node.name.value !== 'post' || !node.selectionSet) {
				return
			}
			if (hasSeoField(node.selectionSet.selections)) {
				return
			}
			return {
				...node,
				selectionSet: {
					...node.selectionSet,
					selections: [...node.selectionSet.selections, seoSelection()],
				},
			}
		},
	})
}
