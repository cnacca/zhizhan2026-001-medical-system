# CS List and Drawer Pages Spec

Applies to orders, designs, products, billing, delivery and outsourcing.

- quick filters: `gap: 6px`, `margin-bottom: 14px`; pill `padding: 5px 13px`, height `27–28px`
- table toolbar: `padding: 10px 14px`, about `49px`
- table heading cells: `padding: 9px 13px`, about `31px`
- table body cells: `padding: 10px 13px`; content-driven height
- container: white, `1.5px solid #e2e8f0`, `14px` radius
- detail: right drawer `540px × 100vh`, header about `61px`, body `padding: 16px 20px`
- wide billing table: `overflow-x: auto` inside the table card only

Clicking a row opens the drawer. Escape/close button closes it. Filtering away the selected row closes the drawer. Loading, error, empty and permission states occupy the same card frame and never invent demo rows.
